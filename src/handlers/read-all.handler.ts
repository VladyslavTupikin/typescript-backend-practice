import { Context } from "hono";
import { RestHandler } from "./rest-handler.js";
import sqlite3 from "sqlite3";
import { HttpStatusCode } from "../http-status-codes.js";

export class ReadAllProducts implements RestHandler {
  constructor(private db: sqlite3.Database) {}

  public handle(c: Context): Promise<Response> {
    return new Promise((resolve) => {
      const sqlQuery = "SELECT * FROM products";

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
        resolve(c.json(rows));
      };

      this.db.all(`${sqlQuery}`, dbCallback);
    });
  }
}
