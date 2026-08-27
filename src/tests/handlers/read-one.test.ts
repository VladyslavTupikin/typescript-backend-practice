// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "../../app.js";
import sqlite3 from "sqlite3";
import { HttpStatusCode } from "../../http-status-codes.js";

describe("REST API: GET one", () => {
  let app: Application;
  let db: sqlite3.Database;

  beforeEach(async () => {
    db = new sqlite3.Database(":memory:");
    app = new Application(db);

    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        const createTableSQL =
          "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)";

        const fillTableSQL =
          "INSERT INTO products (id, name, price) VALUES (1, 'Bread', 3.55), (2, 'Tea', 2.30), (3, 'Butter', 8.99),(4, 'Sausage', 11.0)";

        const dbCallback = function (err: Error) {
          if (err) return reject(err);
          resolve();
        };

        db.run(createTableSQL, dbCallback);
        db.run(fillTableSQL, dbCallback);
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const cleanDataSQL = "DELETE FROM products";

      const dbCallback = function (err: Error) {
        if (err) return reject(err);
        resolve();
      };

      db.run(cleanDataSQL, dbCallback);
    });
  });

  it("GET /products/:id - should return OK (200) and json of one specific product", async () => {
    const res = await app.app.request("/products/1");
    const expected = [{ id: 1, name: "Bread", price: 3.55 }];

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(await res.json()).toEqual(expected);
  });

  it("GET /products/:id - should return error NOT_FOUND (404) because product does not exist", async () => {
    const res = await app.app.request("/products/11");

    const expected = {
      error: "Product not found",
    };

    expect(res.status).toBe(HttpStatusCode.NOT_FOUND);
    expect(await res.json()).toEqual(expected);
  });

  it("GET /products/:id - should return INTERNAL_SERVER_ERROR (500) when database run fails", async () => {
    vi.spyOn(db, "all").mockImplementation((...args: any[]) => {
      const callback = args.find((arg) => typeof arg === "function");
      if (callback) {
        callback(
          new Error("SQLITE_ERROR: database disk image is malformed"),
          null,
        );
      }
      return db;
    });

    const res = await app.app.request("/products/1");
    const expected = {
      error: "SQLITE_ERROR: database disk image is malformed",
    };

    expect(res.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual(expected);

    vi.restoreAllMocks();
  });
});
