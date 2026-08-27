// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { Context } from "hono";
import { RestHandler } from "./rest-handler.js";
import sqlite3, { RunResult } from "sqlite3";
import { HttpStatusCode } from "../http-status-codes.js";

export class DeleteProduct implements RestHandler {
  constructor(private db: sqlite3.Database) {}

  async handle(c: Context): Promise<Response> {
    return new Promise((resolve) => {
      this.db.serialize(() => {
        const reqID = c.req.param("id");
        const getSQL = "SELECT name,price FROM products WHERE id = ?";
        const sqlDelete = "DELETE FROM products WHERE id = ?";

        const dbGetCallback = function (err: Error, rows: []) {
          if (err) {
            resolve(
              c.json(
                { error: "Internal server error." },
                HttpStatusCode.INTERNAL_SERVER_ERROR,
              ),
            );
            return;
          }

          if (!rows) {
            resolve(
              c.json({ error: "Product not found." }, HttpStatusCode.NOT_FOUND),
            );
            return;
          }
        };

        this.db.get(getSQL, reqID, dbGetCallback);

        const dbDeleteCallback = function (this: RunResult, err: Error | null) {
          if (err) {
            resolve(
              c.json(
                { error: "Internal server error." },
                HttpStatusCode.INTERNAL_SERVER_ERROR,
              ),
            );
            return;
          }

          resolve(
            c.json(
              {
                message: "Product deleted successfully.",
              },
              HttpStatusCode.OK,
            ),
          );
        };

        this.db.run(sqlDelete, reqID, dbDeleteCallback);
      });
    });
  }
}
