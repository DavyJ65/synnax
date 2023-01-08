// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Box, RGBATuple, XY, ZERO_XY } from "@synnaxlabs/pluto";

import { Renderer, RenderingContext } from "../render";

const CLEAR_COLOR: RGBATuple = [0, 0, 0, 0];

export class ScissoredRenderer<R> implements Renderer<R> {
  readonly wrapped: Renderer<R>;
  private readonly box: Box;
  private readonly clear: boolean;
  private readonly overscan: XY;

  constructor(
    wrapped: Renderer<R>,
    box: Box,
    clear: boolean = true,
    overscan: XY = ZERO_XY
  ) {
    this.wrapped = wrapped;
    this.box = box;
    this.clear = clear;
    this.overscan = overscan;
  }

  get type(): string {
    return this.wrapped.type;
  }

  compile(gl: WebGLRenderingContext): void {
    this.wrapped.compile(gl);
  }

  async render(ctx: RenderingContext, req: R): Promise<void> {
    ctx.gl.enable(ctx.gl.SCISSOR_TEST);
    this.scissor(ctx);
    this.maybeClear(ctx);
    await this.wrapped.render(ctx, req);
    ctx.gl.disable(ctx.gl.SCISSOR_TEST);
  }

  private maybeClear(ctx: RenderingContext): void {
    if (this.clear) {
      ctx.gl.clearColor(...CLEAR_COLOR);
      ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);
    }
  }

  private scissor(ctx: RenderingContext): void {
    const { x, y } = ctx.offset(this.box, "px");
    const { width, height } = this.box;
    const { x: ox, y: oy } = this.overscan;
    ctx.gl.scissor(
      (x - ox / 2) * ctx.dpr,
      (y - ox / 2) * ctx.dpr,
      (width + ox) * ctx.dpr,
      (height + oy) * ctx.dpr
    );
  }
}
