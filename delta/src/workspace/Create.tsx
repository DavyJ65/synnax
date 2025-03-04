// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@synnaxlabs/media";
import { Align, Button, Header, Input, Nav, Synnax } from "@synnaxlabs/pluto";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";

import { Layout } from "@/layout";

import { add } from "./slice";

export const createWindowLayout: Layout.LayoutState = {
  key: "createWorkspace",
  type: "createWorkspace",
  windowKey: "createWorkspace",
  name: "Create Workspace",
  location: "window",
  window: {
    resizable: false,
    size: { height: 225, width: 625 },
    navTop: true,
    transparent: true,
  },
};

const formSchema = z.object({ name: z.string().nonempty() });

type CreateFormProps = z.infer<typeof formSchema>;

export const Create = ({ onClose }: Layout.RendererProps): ReactElement => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(formSchema),
  });

  const client = Synnax.use();
  const dispatch = useDispatch();

  const onSubmit = async ({ name }: CreateFormProps): Promise<void> => {
    if (client == null) return;
    const ws = await client.workspaces.create({
      name,
      layout: Layout.ZERO_SLICE_STATE,
    });
    dispatch(add({ workspaces: [ws] }));
    dispatch(Layout.setWorkspace({ slice: ws.layout }));
    onClose();
  };

  return (
    <Align.Space style={{ height: "100%" }}>
      <Header.Header level="h4" divided>
        <Header.Title startIcon={<Icon.Workspace />}>Create a Workspace</Header.Title>
      </Header.Header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit)(e);
        }}
        style={{ flexGrow: 1 }}
        id="create-workspace"
      >
        <Align.Space className="delta-form">
          <Input.ItemControlled name="name" control={control} grow autoFocus />
        </Align.Space>
      </form>
      <Nav.Bar location="bottom" size={48}>
        <Nav.Bar.End style={{ padding: "1rem" }}>
          <Button.Button type="submit" form="create-workspace">
            Save
          </Button.Button>
        </Nav.Bar.End>
      </Nav.Bar>
    </Align.Space>
  );
};
