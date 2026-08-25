import { Context } from "hono";

export interface RestHandler {
  handle(c: Context): Promise<Response> | Response;
}
