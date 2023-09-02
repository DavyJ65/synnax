// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement } from "react";

import { Align } from "@/align";
import { useUniqueKey } from "@/hooks/useUniqueKey";
import { Text } from "@/text";
import { Theming } from "@/theming";
import { useGridPosition } from "@/vis/lineplot/LinePlot";

export type TitleProps<L extends Text.Level = "h2"> = Text.MaybeEditableProps<L>;

export const Title = <L extends Text.Level = "h2">({
  level = "h2" as TitleProps<L>["level"],
  ...props
}: TitleProps<L>): ReactElement => {
  const key = useUniqueKey();
  const font = Theming.useTypography(level);
  const gridStyle = useGridPosition(
    {
      key,
      size: (font.lineHeight + 1) * font.baseSize,
      loc: "top",
      order: "first",
    },
    "Title",
  );
  return (
    <Align.Space justify="center" align="center" style={gridStyle}>
      {/* @ts-expect-error */}
      <Text.MaybeEditable<L> {...props} level={level} />
    </Align.Space>
  );
};
