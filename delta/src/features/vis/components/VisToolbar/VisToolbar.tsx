// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Space, Text } from "@synnaxlabs/pluto";

import { useControlledVis } from "../../hooks";
import { LinePlotToolBar } from "../../line/components/controls/LinePlotToolbar";
import { ControlledLineVisProps } from "../../line/components/controls/types";
import { Vis } from "../../types";
import { VisCreateButton } from "../VisCreateButton";

import { VisIcon, VisToolbarTitle } from "./VisToolbarTitle";

import { ToolbarHeader } from "@/components";

const NoVisContent = (): JSX.Element => (
  <Space justify="spaceBetween" style={{ height: "100%" }}>
    <ToolbarHeader>
      <VisToolbarTitle />
    </ToolbarHeader>
    <Space.Centered>
      <Text level="h4">No Active Visualization</Text>
      <VisCreateButton />
    </Space.Centered>
  </Space>
);

const Content = (): JSX.Element => {
  const controlled = useControlledVis<Vis>();
  if (controlled == null) return <NoVisContent />;

  switch (controlled.vis.variant) {
    default:
      return <LinePlotToolBar {...(controlled as ControlledLineVisProps)} />;
  }
};

export const VisToolbar = {
  key: "visualization",
  content: <Content />,
  icon: <VisIcon />,
  minSize: 150,
  maxSize: 500,
};
