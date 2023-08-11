// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { useMemo } from "react";

import { Rate } from "@synnaxlabs/x";

import { TelemSourceProps } from "@/core/vis/telem";
import {
  IterativeXYTelem,
  IterativeXYTelemProps,
  StaticPointTelem,
  StaticXYTelem,
  StaticXYTelemProps,
} from "@/telem/static/aether";

const useStaticXYTelem = (props: StaticXYTelemProps): TelemSourceProps => {
  const transfer = useMemo(
    () => [...props.x.map((x) => x.buffer), ...props.y.map((y) => y.buffer)],
    [props]
  );
  return {
    type: StaticXYTelem.TYPE,
    props,
    transfer,
  };
};

const useIterativeXYTelem = (props: IterativeXYTelemProps): TelemSourceProps => {
  return useMemo(
    () => ({
      variant: "xy",
      type: IterativeXYTelem.TYPE,
      props: {
        ...props,
        rate: new Rate(props.rate).valueOf(),
      },
      transfer: [...props.x.map((x) => x.buffer), ...props.y.map((y) => y.buffer)],
    }),
    []
  );
};

const usePointTelem = (value: number): TelemSourceProps => {
  return {
    type: StaticPointTelem.TYPE,
    props: value,
  };
};

export const StaticTelem = {
  useXY: useStaticXYTelem,
  useIterativeXY: useIterativeXYTelem,
  useNumeric: usePointTelem,
};
