// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement, useMemo } from "react";

import { Viewport } from "@synnaxlabs/pluto";
import { useDispatch } from "react-redux";

import { useSelectViewporMode } from "@/pid/selectors";
import { setViewportMode } from "@/pid/slice";

export const NavControls = (): ReactElement => {
  const mode = useSelectViewporMode();
  const d = useDispatch();

  const handleModeChange = (mode: Viewport.Mode): void => {
    d(setViewportMode({ mode }));
  };

  const triggers = useMemo(() => Viewport.DEFAULT_TRIGGERS[mode], [mode]);

  return (
    <Viewport.SelectMode
      bordered={false}
      rounded={false}
      value={mode}
      onChange={handleModeChange}
      triggers={triggers}
      disable={["zoom", "click", "zoomReset"]}
    />
  );
};
