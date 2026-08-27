// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { Context } from "hono";

export interface RestHandler {
  handle(c: Context): Promise<Response> | Response;
}
