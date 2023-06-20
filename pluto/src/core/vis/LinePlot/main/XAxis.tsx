// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { PropsWithChildren, ReactElement, memo } from "react";

import { Optional, XY, Location, CrudeOuterLocation } from "@synnaxlabs/x";

import { Aether } from "@/core/aether/main";
import { useResize } from "@/core/hooks";
import { Theming } from "@/core/theming";
import { useAxisPosition } from "@/core/vis/LinePlot/main/LinePlot";
import {
  XAxisState as WorkerXAxisState,
  XAxis as WorkerXAxis,
  xAxisState,
} from "@/core/vis/LinePlot/worker";

export interface XAxisProps
  extends PropsWithChildren,
    Optional<Omit<WorkerXAxisState, "position">, "color" | "font" | "gridColor"> {
  resizeDebounce?: number;
}

export const XAxis = memo(
  ({
    children,
    resizeDebounce: debounce = 100,
    location = "bottom",
    ...props
  }: XAxisProps): ReactElement => {
    const theme = Theming.use();
    const [{ key, path }, , setState] = Aether.use(WorkerXAxis.TYPE, xAxisState, {
      color: theme.colors.gray.p2,
      gridColor: theme.colors.gray.m1,
      position: XY.ZERO,
      font: Theming.font(theme, "small"),
      location,
      ...props,
    });

    const gridStyle = useAxisPosition(
      new Location(location).crude as CrudeOuterLocation,
      key,
      "XAxis"
    );

    const resizeRef = useResize(
      (box) => setState((p) => ({ ...p, position: box.topLeft })),
      { debounce }
    );

    return (
      <>
        <div className="x-axis" style={gridStyle} ref={resizeRef} />
        <Aether.Composite path={path}>{children}</Aether.Composite>
      </>
    );
  }
);
XAxis.displayName = "XAxis";
