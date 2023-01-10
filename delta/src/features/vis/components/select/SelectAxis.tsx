import { useCallback } from "react";

import { Input, InputItemProps } from "@synnaxlabs/pluto";

import { AxisKey, axisLabel } from "../../types";

import {
  SelectChanel,
  SelectChannelProps,
  SelectMultipleChannels,
  SelectMultipleChannelsProps,
} from "@/components";

export interface SelectMultipleAxesInputItemProps
  extends Omit<
    InputItemProps<readonly string[], SelectMultipleChannelsProps>,
    "onChange" | "label"
  > {
  axis: AxisKey;
  onChange: (key: AxisKey, v: readonly string[]) => void;
}

export const SelectMultipleAxesInputItem = ({
  axis,
  onChange,
  ...props
}: SelectMultipleAxesInputItemProps): JSX.Element => (
  <Input.Item<readonly string[], SelectMultipleChannelsProps>
    {...props}
    label={axisLabel(axis)}
    onChange={useCallback((v) => onChange(axis, v), [])}
  >
    {SelectMultipleChannels}
  </Input.Item>
);

export interface SelectAxisInputItemProps
  extends Omit<InputItemProps<string, SelectChannelProps>, "onChange" | "label"> {
  axis: AxisKey;
  onChange: (key: AxisKey, v: string) => void;
}

export const SelectAxisInputItem = ({
  axis,
  onChange,
  ...props
}: SelectAxisInputItemProps): JSX.Element => (
  <Input.Item<string, SelectChannelProps>
    {...props}
    label={axisLabel(axis)}
    onChange={useCallback((v) => onChange(axis, v), [axis])}
  >
    {SelectChanel}
  </Input.Item>
);
