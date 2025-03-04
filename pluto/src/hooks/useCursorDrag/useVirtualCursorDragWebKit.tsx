// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type DragEvent, useEffect } from "react";

import { xy, box } from "@synnaxlabs/x";

import { useStateRef } from "@/hooks/useStateRef";
import { Triggers } from "@/triggers";

import { type UseVirtualCursorDragProps } from "./types";

interface RefState {
  start: xy.XY;
  mouseKey: Triggers.Key;
}

const INITIAL_STATE: RefState = {
  start: xy.ZERO,
  mouseKey: "MouseLeft",
};

export const useVirtualCursorDragWebKit = ({
  ref,
  onMove,
  onStart,
  onEnd,
}: UseVirtualCursorDragProps): void => {
  const [stateRef, setRef] = useStateRef<RefState>(INITIAL_STATE);
  useEffect(() => {
    if (ref.current == null) return;
    const { current: el } = ref;

    const handleMove = (e: MouseEvent): void => {
      const next = xy.construct(e);
      const { mouseKey, start } = stateRef.current;
      onMove?.(box.construct(start, next), mouseKey, e);
    };

    const handleDown = (e: PointerEvent): void => {
      el.setPointerCapture(e.pointerId);
      el.onpointermove = handleMove;
      const start = xy.construct(e);
      const mouseKey = Triggers.eventKey(e);
      setRef({ start, mouseKey });
      onStart?.(start, mouseKey, e as unknown as DragEvent);
      el.addEventListener("pointerup", handleUp, { once: true });
    };
    el.addEventListener("pointerdown", handleDown);

    const handleUp = (e: PointerEvent): void => {
      el.onpointermove = null;
      el.releasePointerCapture(e.pointerId);
      const { start, mouseKey } = stateRef.current;
      onEnd?.(
        box.construct(start, xy.construct(e)),
        mouseKey,
        e as unknown as MouseEvent,
      );
    };

    return () => el.removeEventListener("pointerdown", handleDown);
  }, [onMove, onStart, onEnd]);
};
