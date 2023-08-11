// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { CrudeTimeRange, CrudeTimeSpan } from "@synnaxlabs/x";

interface BaseRange {
  name: string;
  key: string;
}

export type StaticRange = BaseRange & {
  variant: "static";
  timeRange: CrudeTimeRange;
}

export type DynamicRange = BaseRange & {
  variant: "dynamic";
  span: CrudeTimeSpan;
}

export type Range  = StaticRange | DynamicRange;
