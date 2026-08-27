import { Context } from "hono";
import { RestHandler } from "./rest-handler.js";
import sqlite3, { RunResult } from "sqlite3";
import { HttpStatusCode } from "../http-status-codes.js";

export class UpdateProduct implements RestHandler {
  constructor(private db: sqlite3.Database) {}

  async handle(c: Context): Promise<Response> {
    let body: any;
    try {
      body = await c.req.json<{ name: string; price: number }>();
    } catch (err) {
      return c.json(
        { error: "Invalid data format." },
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Since body object received all params as json, they are strings,
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

      this.db.serialize(() => {
        const reqID = c.req.param("id");
        const getSQL = "SELECT name,price FROM products WHERE id = ?";
        const sqlUpdate =
          "UPDATE products SET name = ?, price = ? WHERE id = ?";

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

        const dbUpdateCallback = function (this: RunResult, err: Error | null) {
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
                message: "Product updated successfully.",
              },
              HttpStatusCode.OK,
            ),
          );
        };

        this.db.run(
          sqlUpdate,
          [body.name, body.price, reqID],
          dbUpdateCallback,
        );
      });
    });
  }
}
