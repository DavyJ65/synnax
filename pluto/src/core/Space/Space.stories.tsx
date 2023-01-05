// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import type { ComponentMeta, ComponentStory } from "@storybook/react";

import { Space, SpaceProps } from ".";

import { Button } from "@/core/Button";
import { ComponentSizes } from "@/util/component";

const story: ComponentMeta<typeof Space> = {
  title: "Core/Space",
  component: Space,
  argTypes: {
    direction: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    size: {
      control: { type: "select" },
      options: ComponentSizes,
    },
    align: {
      control: { type: "select" },
      options: Space.Alignments,
    },
    justify: {
      control: { type: "select" },
      options: Space.Justifications,
    },
  },
};

const Template: ComponentStory<typeof Space> = (args: SpaceProps) => (
  <Space {...args}>
    <Button>Button 1</Button>
    <Button>Button 1</Button>
    <Button>Button 1</Button>
  </Space>
);

export const Basic = Template.bind({});
Basic.args = {
  direction: "horizontal",
  size: "medium",
  align: "center",
  justify: "start",
};

// eslint-disable-next-line import/no-default-export
export default story;
