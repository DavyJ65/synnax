import { useCallback, useRef } from "react";

import { type Key, type KeyedRenderableRecord } from "@synnaxlabs/x";

import { useContext } from "@/list/Context";
import { Triggers } from "@/triggers";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HoverProps<
  K extends Key = Key,
  E extends KeyedRenderableRecord<K, E> = KeyedRenderableRecord<K>,
> {}

const UP_TRIGGER: Triggers.Trigger = ["ArrowUp"];
const DOWN_TRIGGER: Triggers.Trigger = ["ArrowDown"];
const SELECT_TRIGGER: Triggers.Trigger = ["Enter"];

export const Hover = <
  K extends Key = Key,
  E extends KeyedRenderableRecord<K, E> = KeyedRenderableRecord<K>,
>(
  props: HoverProps<K, E>,
): null => {
  const {
    data,
    select: { onSelect },
    hover: { value, onChange },
  } = useContext<K, E>();
  const posRef = useRef<number>(value);

  const handleTrigger = useCallback(
    ({ triggers, stage }: Triggers.UseEvent) => {
      if (stage !== "start") return;
      if (Triggers.match(triggers, [UP_TRIGGER]))
        onChange((pos) => {
          const v = pos === 0 ? data.length - 1 : pos - 1;
          posRef.current = v;
          return v;
        });
      else if (Triggers.match(triggers, [DOWN_TRIGGER]))
        onChange((pos) => {
          const v = pos === data.length - 1 ? 0 : pos + 1;
          posRef.current = v;
          return v;
        });
      else if (Triggers.match(triggers, [SELECT_TRIGGER]))
        onSelect?.(data[posRef.current].key);
    },
    [data, onSelect],
  );

  Triggers.use({
    triggers: [UP_TRIGGER, DOWN_TRIGGER, SELECT_TRIGGER],
    callback: handleTrigger,
    loose: true,
  });

  return null;
};
