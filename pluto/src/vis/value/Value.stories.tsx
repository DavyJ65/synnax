// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement } from "react";

import { type Meta, type StoryFn } from "@storybook/react";

import { Remote } from "@/telem/remote";
import { Canvas } from "@/vis/canvas";
import { Value } from "@/vis/value";

const story: Meta<typeof Value.Value> = {
  title: "Value",
  component: Value.Value,
};

const Example = (): ReactElement => {
  const telem = Remote.useNumericSource({ channel: 65538 });
  return (
    <Canvas.Canvas
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Value.Value telem={telem} style={{ width: 100 }} units="psi" level="h4" />
    </Canvas.Canvas>
  );
};

export const Primary: StoryFn<typeof Value> = () => <Example />;

// eslint-disable-next-line import/no-default-export
export default story;
