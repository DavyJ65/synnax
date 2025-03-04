// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { ReactElement, useState } from "react";

import type { Meta, StoryFn } from "@storybook/react";
import { AiOutlineDelete } from "react-icons/ai";

import { Button } from "@/button";

const story: Meta<typeof Button.Button> = {
  title: "Button",
  component: Button.Button,
  argTypes: {
    variant: {
      options: ["filled", "outlined", "text"],
      control: { type: "select" },
    },
  },
};

const Template = (args: Button.ButtonProps): ReactElement => (
  <Button.Button {...args} />
);

export const Primary: StoryFn<typeof Button.Button> = Template.bind({});
Primary.args = {
  size: "medium",
  startIcon: <AiOutlineDelete />,
  children: "Button",
};

export const Outlined = (): ReactElement => (
  <Button.Button variant="outlined" endIcon={<AiOutlineDelete />}>
    Button
  </Button.Button>
);

export const Toggle = (): ReactElement => {
  const [value, setValue] = useState(false);
  return (
    <Button.ToggleIcon value={value} onChange={() => setValue((c) => !c)}>
      <AiOutlineDelete />
    </Button.ToggleIcon>
  );
};

export const IconOnly = (): ReactElement => (
  <Button.Icon>
    <AiOutlineDelete />
  </Button.Icon>
);

// eslint-disable-next-line import/no-default-export
export default story;
