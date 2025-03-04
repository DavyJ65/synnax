// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement } from "react";

import { type channel } from "@synnaxlabs/client";

import { Channel } from "@/channel";
import { Input } from "@/input";
import { type remote } from "@/telem/remote/aether";
import { componentRenderProp } from "@/util/renderProp";

export interface NumericFormProps extends Input.ItemProps<remote.NumericSourceProps> {}

export const NumericSourceForm = ({
  value,
  onChange,
  ...props
}: NumericFormProps): ReactElement => {
  const handleChannelChange = (channel: channel.Key): void =>
    onChange({ ...value, channel });

  return (
    <Input.Item<channel.Key, channel.Key, Channel.SelectSingleProps>
      label="Channel"
      value={value.channel}
      onChange={handleChannelChange}
      {...props}
    >
      {componentRenderProp(Channel.SelectSingle)}
    </Input.Item>
  );
};
