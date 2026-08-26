import { Context } from "hono";
import { RestHandler } from "./rest-handler.js";
import sqlite3 from "sqlite3";
import { HttpStatusCode } from "../http-status-codes.js";

export class ReadOneProduct implements RestHandler {
  constructor(private db: sqlite3.Database) {}

  handle(c: Context): Promise<Response> {
    return new Promise((resolve) => {
      const id = c.req.param("id");

      const sqlQuery = `SELECT * FROM products WHERE id = ?`;
      const dbCallback = function (err: Error, rows: []) {
        if (err) {
          resolve(
            c.json(
              { error: err.message },
              HttpStatusCode.INTERNAL_SERVER_ERROR,
            ),
          );
          return;
        }

        if (!rows || rows.length == 0) {
          resolve(
            c.json({ error: "Product not found" }, HttpStatusCode.NOT_FOUND),
          );
          return;
        }

        resolve(c.json(rows));
      };

      this.db.all(sqlQuery, id, dbCallback);
    });
  }
}
