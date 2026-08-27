// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "../../app.js";
import sqlite3 from "sqlite3";
import { HttpStatusCode } from "../../http-status-codes.js";

describe("REST API: POST", () => {
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

  it("POST /products - should return CREATED (201) and add new product with code", async () => {
    const payload = { name: "Grapes", price: 5.25 };

    const res = await app.app.request("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const expected = {
      message: "Product added successfully.",
      productId: 5,
    };

    expect(res.status).toBe(HttpStatusCode.CREATED);
    expect(await res.json()).toEqual(expected);
  });

  it("POST /products - should return error BAD_REQUEST (400) if name is not part of the query", async () => {
    const payload = { price: 5.25 };

    const res = await app.app.request("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const expected = {
      error: "Invalid data format",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("POST /products - should return error BAD_REQUEST (400) if price is not part of the query", async () => {
    const payload = { name: "Banana" };

    const res = await app.app.request("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const expected = {
      error: "Invalid data format",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("POST /products - should return error BAD_REQUEST (400) if name is not a String", async () => {
    const payload = { name: 546, price: 2.12 };

    const res = await app.app.request("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const expected = {
      error: "Invalid data format",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("POST /products - should return error BAD_REQUEST (400) if price is not a Number", async () => {
    const payload = { name: "Banana", price: "apple" };

    const res = await app.app.request("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const expected = {
      error: "Invalid data format",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("POST /products - should return INTERNAL_SERVER_ERROR (500) when database run fails", async () => {
    vi.spyOn(db, "run").mockImplementation((sql, params, callback) => {
      if (typeof callback === "function") {
        callback.call(
          { lastID: 0, changes: 0 },
          new Error("SQLITE_ERROR: database disk image is malformed"),
        );
      }
      return db;
    });

    const res = await app.app.request("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bread", price: 3.55 }),
    });

    expect(res.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);

    expect(await res.json()).toEqual({
      error: "SQLITE_ERROR: database disk image is malformed",
    });

    vi.restoreAllMocks();
  });
});
