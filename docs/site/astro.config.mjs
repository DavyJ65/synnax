/*
 * Copyright 2023 Synnax Labs, Inc.
 *
 * Use of this software is governed by the Business Source License included in the file
 * licenses/BSL.txt.
 *
 * As of the Change Date specified in that file, in accordance with the Business Source
 * License, use of this software will be governed by the Apache License, Version 2.0,
 * included in the file licenses/APL.txt.
 */

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

const shikiResourcePaths = Object.keys(
    import.meta.glob([
        "../../node_modules/.pnpm/shiki@*/node_modules/shiki/languages/*.tmLanguage.json",
        "../../node_modules/.pnpm/shiki@*/node_modules/shiki/themes/*.json",
    ])
);

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    integrations: [react(), mdx()],
    output: "server",
    adapter: vercel({
        includeFiles: shikiResourcePaths,
    }),
    markdown: {
        shikiConfig: {
            theme: "github-dark",
        },
    },
    site: "https://docs.synnaxlabs.com",
});
