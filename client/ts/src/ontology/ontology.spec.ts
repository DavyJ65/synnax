// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { describe, expect, test } from "vitest";

import { ontology } from "@/ontology";
import { group } from "@/ontology/group";
import { newClient } from "@/setupspecs";

const client = newClient();

const randomName = () => `group-${Math.random()}`;

describe("Ontology", () => {
  test("retrieve", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const g2 = await client.ontology.retrieve(g.ontologyID);
    expect(g2.name).toEqual(name);
  });
  test("retrieve children", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const name2 = randomName();
    const g2 = await client.ontology.groups.create(g.ontologyID, name2);
    const children = await client.ontology.retrieveChildren(g.ontologyID);
    expect(children.length).toEqual(1);
    expect(children[0].name).toEqual(name2);
  });
  test("retrieve parents", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const name2 = randomName();
    const g2 = await client.ontology.groups.create(g.ontologyID, name2);
    const parents = await client.ontology.retrieveParents(g2.ontologyID);
    expect(parents.length).toEqual(1);
    expect(parents[0].name).toEqual(name);
  });
  test("add children", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const name2 = randomName();
    const g2 = await client.ontology.groups.create(ontology.Root, name2);
    await client.ontology.addChildren(g.ontologyID, g2.ontologyID);
    const children = await client.ontology.retrieveChildren(g.ontologyID);
    expect(children.length).toEqual(1);
    expect(children[0].name).toEqual(name2);
  });
  test("remove children", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const name2 = randomName();
    const g2 = await client.ontology.groups.create(ontology.Root, name2);
    await client.ontology.addChildren(g.ontologyID, g2.ontologyID);
    await client.ontology.removeChildren(g.ontologyID, g2.ontologyID);
    const children = await client.ontology.retrieveChildren(g.ontologyID);
    expect(children.length).toEqual(0);
  });
  test("move children", async () => {
    const name = randomName();
    const g = await client.ontology.groups.create(ontology.Root, name);
    const name2 = randomName();
    const g2 = await client.ontology.groups.create(ontology.Root, name2);
    const oldRootLength = (await client.ontology.retrieveChildren(ontology.Root))
      .length;
    await client.ontology.moveChildren(ontology.Root, g.ontologyID, g2.ontologyID);
    const children = await client.ontology.retrieveChildren(g.ontologyID);
    expect(children.length).toEqual(1);
    const newRootLength = (await client.ontology.retrieveChildren(ontology.Root))
      .length;
    expect(newRootLength).toEqual(oldRootLength - 1);
  });
});
