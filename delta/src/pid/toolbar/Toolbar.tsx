// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { type ReactElement, useCallback } from "react";

import { Icon } from "@synnaxlabs/media";
import { Align, Status, Tabs, Text } from "@synnaxlabs/pluto";
import { useDispatch } from "react-redux";

import { ToolbarHeader, ToolbarTitle } from "@/components";
import { Layout } from "@/layout";
import { useSelect, useSelectToolbar } from "@/pid/selectors";
import { type ToolbarTab, setActiveToolbarTab, setEditable } from "@/pid/slice";
import { Elements } from "@/pid/toolbar/Elements";
import { PropertiesControls } from "@/pid/toolbar/Properties";

export interface ToolbarProps {
  layoutKey: string;
}

const TABS = [
  {
    tabKey: "elements",
    name: "Elements",
  },
  {
    tabKey: "properties",
    name: "Properties",
  },
];

interface NotEditableContentProps extends ToolbarProps {}

const NotEditableContent = ({ layoutKey }: NotEditableContentProps): ReactElement => {
  const dispatch = useDispatch();
  return (
    <Align.Center direction="x" size="small">
      <Status.Text variant="disabled" hideIcon>
        PID is not editable. To make changes,
      </Status.Text>
      <Text.Link
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setEditable({ layoutKey, editable: true }));
        }}
        level="p"
      >
        enable edit mode.
      </Text.Link>
    </Align.Center>
  );
};

export const Toolbar = ({ layoutKey }: ToolbarProps): ReactElement | null => {
  const { name } = Layout.useSelectRequired(layoutKey);
  const dispatch = useDispatch();
  const toolbar = useSelectToolbar();
  const pid = useSelect(layoutKey);
  const content = useCallback(
    ({ tabKey }: Tabs.Tab): ReactElement => {
      if (!pid.editable) return <NotEditableContent layoutKey={layoutKey} />;
      switch (tabKey) {
        case "elements":
          return <Elements layoutKey={layoutKey} />;
        default:
          return <PropertiesControls layoutKey={layoutKey} />;
      }
    },
    [layoutKey, pid?.editable]
  );

  const handleTabSelect = useCallback(
    (tabKey: string): void => {
      dispatch(setActiveToolbarTab({ tab: tabKey as ToolbarTab }));
    },
    [dispatch]
  );

  if (pid == null) return null;

  return (
    <Align.Space empty style={{ height: "100%" }}>
      <Tabs.Provider
        value={{
          tabs: TABS,
          selected: toolbar.activeTab,
          onSelect: handleTabSelect,
          content,
        }}
      >
        <ToolbarHeader>
          <ToolbarTitle icon={<Icon.PID />}>{name}</ToolbarTitle>
          <Tabs.Selector style={{ borderBottom: "none" }} size="large" />
        </ToolbarHeader>
        <Tabs.Content />
      </Tabs.Provider>
    </Align.Space>
  );
};
