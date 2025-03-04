#  Copyright 2023 Synnax Labs, Inc.
#
#  Use of this software is governed by the Business Source License included in the file
#  licenses/BSL.txt.
#
#  As of the Change Date specified in that file, in accordance with the Business Source
#  License, use of this software will be governed by the Apache License, Version 2.0,
#  included in the file licenses/APL.txt.

from typing import overload

from numpy import ndarray
from freighter import StreamClient, AsyncStreamClient

from alamos import Instrumentation, NOOP
from synnax.exceptions import QueryError
from synnax.framer.frame import Frame
from synnax.framer.adapter import WriteFrameAdapter, ReadFrameAdapter
from synnax.framer.writer import Writer
from synnax.framer.iterator import Iterator
from synnax.channel.payload import (
    ChannelParams,
    ChannelKey,
    ChannelName,
    ChannelKeys,
    ChannelNames,
    ChannelPayload,
)
from synnax.channel.retrieve import ChannelRetriever
from synnax.channel.payload import normalize_channel_params
from synnax.framer.streamer import Streamer, AsyncStreamer
from synnax.telem import TimeRange, CrudeTimeStamp, Series, TimeStamp
from synnax.telem.authority import Authority, CrudeAuthority


class Client:
    """SegmentClient provides interfaces for reading and writing segmented
    telemetry from a Synnax Cluster. SegmentClient should not be instantiated
    directly, but rather used through the synnax.Synnax class.
    """

    __client: StreamClient
    __async_client: AsyncStreamClient
    __channels: ChannelRetriever
    instrumentation: Instrumentation

    def __init__(
        self,
        client: StreamClient,
        async_client: AsyncStreamClient,
        retriever: ChannelRetriever,
        instrumentation: Instrumentation = NOOP,
    ):
        self.__client = client
        self.__async_client = async_client
        self.__channels = retriever
        self.instrumentation = instrumentation

    def new_writer(
        self,
        start: CrudeTimeStamp,
        channels: ChannelParams,
        authorities: CrudeAuthority | list[CrudeAuthority] = Authority.ABSOLUTE,
        *,
        name: str = "",
        strict: bool = False,
        suppress_warnings: bool = False,
    ) -> Writer:
        """Opens a new writer on the given channels.

        :param start: Sets the starting timestamp for the first sample in the writer. If
        this timestamp overlaps with existing data for ANY of the provided channels,
        the writer will fail to open.
        :param channels: The channels to write to. This can be a single channel name,
        a list of channel names, a single channel key, or a list of channel keys.
        :param authorities: The control authority to set for each channel on the writer.
        Defaults to absolute authority. If not working with concurrent control,
        it's best to leave this as the default.
        :param strict: Sets whether the writer will fail to write if the data for a
        particular channel does not exactly match this data type. When False,
        the default, the writer will automatically convert the data to the correct
        type if possible.
        :param suppress_warnings: Supress various print warnings that may be emitted
        by the writer.
        """
        adapter = WriteFrameAdapter(self.__channels)
        adapter.update(channels)
        return Writer(
            start=start,
            adapter=adapter,
            client=self.__client,
            strict=strict,
            suppress_warnings=suppress_warnings,
            authorities=authorities,
            name=name
        )

    def new_iterator(
        self,
        tr: TimeRange,
        params: ChannelParams,
    ) -> Iterator:
        """Opens a new iterator over the given channels within the provided time range.

        :param params: A list of channel keys to iterator over.
        :param tr: A time range to iterate over.
        :returns: An Iterator over the given channels within the provided time
        range. See the Iterator documentation for more.
        """
        adapter = ReadFrameAdapter(self.__channels)
        adapter.update(params)
        return Iterator(
            tr=tr,
            adapter=adapter,
            client=self.__client,
            instrumentation=self.instrumentation,
        )

    def write(
        self,
        start: CrudeTimeStamp,
        data: ndarray | Series,
        to: ChannelKey | ChannelName | ChannelPayload,
        strict: bool = False,
    ) -> TimeStamp:
        """Writes telemetry to the given channel starting at the given timestamp.

        :param to: The key of the channel to write to.
        :param start: The starting timestamp of the first sample in data.
        :param data: The telemetry to write to the channel.
        :returns: None.
        """
        with self.new_writer(start, to, strict=strict) as w:
            w.write(to, data)
            ts, ok = w.commit()
            return ts

    @overload
    def read(
        self,
        tr: TimeRange,
        params: ChannelKeys | ChannelNames,
    ) -> Frame:
        ...

    @overload
    def read(
        self,
        tr: TimeRange,
        params: ChannelKey | ChannelName,
    ) -> Series:
        ...

    def read(
        self,
        tr: TimeRange,
        params: ChannelParams,
    ) -> Series | Frame:
        """Reads telemetry from the channel between the two timestamps.

        :param start: The starting timestamp of the range to read from.
        :param end: The ending timestamp of the range to read from.
        :param params: The key or name of the channel to read from.
        :returns: A tuple where the first item is a numpy array containing the telemetry
        and the second item is the time range occupied by that array.
        :raises ContiguityError: If the telemetry between start and end is non-contiguous.
        """
        normal = normalize_channel_params(params)
        frame = self.__read_frame(tr, params)
        if len(normal.params) > 1:
            return frame
        series = frame.get(normal.params[0], None)
        if series is None:
            raise QueryError(
                f"""No data found for channel {normal.params[0]} between {tr}"""
            )
        return series

    def new_streamer(
        self,
        params: ChannelParams,
        from_: CrudeTimeStamp | None = None,
    ) -> Streamer:
        adapter = ReadFrameAdapter(self.__channels)
        adapter.update(params)
        return Streamer(
            from_=from_,
            adapter=adapter,
            client=self.__client,
        )

    async def new_async_streamer(
        self,
        params: ChannelParams,
        from_: CrudeTimeStamp | None = None,
    ) -> AsyncStreamer:
        adapter = ReadFrameAdapter(self.__channels)
        adapter.update(params)
        s = AsyncStreamer(
            from_=from_,
            adapter=adapter,
            client=self.__async_client,
        )
        await s.open()
        return s

    def __read_frame(
        self,
        tr: TimeRange,
        params: ChannelParams,
    ) -> Frame:
        fr = Frame()
        with self.new_iterator(tr, params) as i:
            for frame in i:
                fr.append(frame)
        return fr
