// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "../../app.js";
import sqlite3 from "sqlite3";
import { HttpStatusCode } from "../../http-status-codes.js";

describe("REST API: PATCH", () => {
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

  it("PATCH /products/:id - should return OK (200) and update product info", async () => {
    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bread", price: 8.99 }),
    });

    const expected = {
      message: "Product updated successfully.",
    };

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(await res.json()).toEqual(expected);
  });

  it("PATCH /products/:id - should return BAD_REQUEST (400) when request body is invalid json", async () => {
    const invalidJSON = '{"name":"Bread", "price":32.11';
    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: invalidJSON,
    });

    const expected = {
      error: "Invalid data format.",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("PATCH /products/:id - should return BAD_REQUEST (400) when name is not a string", async () => {
    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: 321, price: 8.99 }),
    });

    const expected = {
      error: "Invalid data format.",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("PATCH /products/:id - should return BAD_REQUEST (400) when price is not a valid number", async () => {
    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "321", price: "Five fifty five" }),
    });

    const expected = {
      error: "Invalid data format.",
    };

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(await res.json()).toEqual(expected);
  });

  it("PATCH /products/:id - should return INTERNAL_SERVER_ERROR (500) when database get fails", async () => {
    vi.spyOn(db, "get").mockImplementation((...args: any[]) => {
      const callback = args.find((arg) => typeof arg === "function");
      if (callback) {
        callback(
          new Error("SQLITE_ERROR: database disk image is malformed"),
          null,
        );
      }
      return db;
    });

    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "321", price: "15.52" }),
    });

    const expected = {
      error: "Internal server error.",
    };

    expect(res.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual(expected);

    vi.restoreAllMocks();
  });

  it("PATCH /products/:id - should return NOT_FOUND (404) when request for non-existing product", async () => {
    const res = await app.app.request("/products/121", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "321", price: "15.52" }),
    });

    const expected = {
      error: "Product not found.",
    };

    expect(res.status).toBe(HttpStatusCode.NOT_FOUND);
    expect(await res.json()).toEqual(expected);
  });

  it("PATCH /products/:id - should return INTERNAL_SERVER_ERROR (500) when database run fails", async () => {
    vi.spyOn(db, "run").mockImplementation((...args: any[]) => {
      const callback = args.find((arg) => typeof arg === "function");
      if (callback) {
        callback(
          new Error("SQLITE_ERROR: database disk image is malformed"),
          null,
        );
      }
      return db;
    });

    const res = await app.app.request("/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "321", price: "15.52" }),
    });

    const expected = {
      error: "Internal server error.",
    };

    expect(res.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual(expected);

    vi.restoreAllMocks();
  });
});
