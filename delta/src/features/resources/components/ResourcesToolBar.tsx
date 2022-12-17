import { useEffect, useState } from "react";

import { OntologyID, OntologyRoot } from "@synnaxlabs/client";
import type { OntologyResource } from "@synnaxlabs/client";
import { Tree, Header, Space } from "@synnaxlabs/pluto";
import type { TreeLeaf } from "@synnaxlabs/pluto";
import { AiFillFolder } from "react-icons/ai";
import { useDispatch } from "react-redux";
import type { Dispatch } from "redux";

import { resourceTypes } from "../resources";

import { useClusterClient } from "@/features/cluster";
import { useLayoutPlacer } from "@/features/layout";

const updateTreeEntry = (
  data: TreeLeaf[],
  newEntry: Partial<TreeLeaf>,
  key: string
): void => {
  data.forEach((entry, i) => {
    if (entry.key === key) {
      entry.children = entry.children ?? [];
      data[i] = { ...entry, ...newEntry };
    } else if (entry.children != null) {
      updateTreeEntry(entry.children, newEntry, key);
    }
  });
};

const convertOntologyResources = (
  dispatch: Dispatch<any>,
  resources: OntologyResource[]
): TreeLeaf[] => {
  return resources.map(({ id, entity: { name } }) => {
    const { icon, hasChildren } = resourceTypes(dispatch)[id.type];
    return {
      key: id.toString(),
      title: name,
      icon,
      hasChildren,
      children: [],
    };
  });
};

const ResourcesTree = (): JSX.Element => {
  const client = useClusterClient();
  const [data, setData] = useState<TreeLeaf[]>([]);
  const dispatch = useDispatch();
  const placer = useLayoutPlacer();

  useEffect(() => {
    if (client == null) return;
    void (async (): Promise<void> => {
      const resources = await client.ontology.retrieveChildren(OntologyRoot);
      setData(convertOntologyResources(dispatch, resources));
    })();
  }, [client]);

  return (
    <Space empty style={{ height: "100%" }}>
      <Header level="h4" divided icon={<AiFillFolder />}>
        Resources
      </Header>
      <Tree
        data={data}
        style={{ overflowY: "auto", overflowX: "hidden" }}
        onSelect={([key]: string[]) => {
          const id = OntologyID.parseString(key);
          const { onSelect } = resourceTypes(placer)[id.type];
          onSelect?.(id);
        }}
        onExpand={(key) => {
          if (client == null || key.length === 0) return;
          void (async () => {
            const resources = await client.ontology.retrieveChildren(
              OntologyID.parseString(key)
            );
            updateTreeEntry(
              data,
              {
                children: convertOntologyResources(dispatch, resources),
              },
              key
            );
            setData(data.map((d) => ({ ...d })));
          })();
        }}
      />
    </Space>
  );
};

export const ResourcesToolBar = {
  key: "resources",
  icon: <AiFillFolder />,
  content: <ResourcesTree />,
};
