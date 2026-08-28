// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { Context } from "hono";
import { RestHandler } from "./rest-handler.js";
import sqlite3, { RunResult } from "sqlite3";
import { HttpStatusCode } from "../http-status-codes.js";

export class CreateProduct implements RestHandler {
  constructor(private db: sqlite3.Database) {}

  async handle(c: Context): Promise<Response> {
    let body;

    try {
      body = await c.req.json<{ name: string; price: number }>();
    } catch (err) {
      return c.json(
        { error: "Invalid data format." },
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Since body object received all params as json they are strings,
    // need to directly convert price to Number
    body.price = Number(body.price);

    return new Promise((resolve) => {
      const isNameInvalid =
        typeof body.name !== "string" || body.name.trim() === "";
      const isPriceInvalid = Number.isNaN(body.price);

      if (isNameInvalid || isPriceInvalid) {
        resolve(
          c.json({ error: "Invalid data format." }, HttpStatusCode.BAD_REQUEST),
        );
        return;
      }

      const sqlQuery = `INSERT INTO products (name,price) VALUES(?,?)`;
      const dbCallback = function (this: RunResult, err: Error | null) {
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
            { message: "Product added successfully.", productId: this.lastID },
            HttpStatusCode.CREATED,
          ),
        );
      };

      this.db.run(sqlQuery, [body.name, body.price], dbCallback);
    });
  }
}
