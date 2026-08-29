// Copyright (c) 2026 Vladyslav Tupikin
// Authorship: Generated with Google Gemini 2.5 Flash
// SPDX-License-Identifier: ISC

import { describe, it, expect, beforeEach } from "vitest";
import sqlite3 from "sqlite3";
import { Application } from "../app.js";
import { HttpStatusCode } from "../http-status-codes.js";

describe("Application - CORS Middleware", () => {
  let appInstance: Application;
  let db: sqlite3.Database;

  const serverIP = "127.0.0.1";
  const port = 5000;
  const clientIP = "127.0.0.2";
  const clientPort = 3000;

  beforeEach(() => {
    db = new sqlite3.Database(":memory:");
    // Client configured at port 3000
    appInstance = new Application(db, serverIP, port, clientIP, clientPort);
  });

  it("allows requests from the configured client port origin", async () => {
    const res = await appInstance.app.request("/products", {
      method: "GET",
      headers: {
        Origin: `http://${clientIP}:${clientPort}`,
      },
    });

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      `http://${clientIP}:${clientPort}`,
    );
  });

  it("handles OPTIONS preflight request for client origin", async () => {
    const res = await appInstance.app.request("/products", {
      method: "OPTIONS",
      headers: {
        Origin: `http://${clientIP}:${clientPort}`,
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(res.status).toBe(HttpStatusCode.NO_CONTENT);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      `http://${clientIP}:${clientPort}`,
    );
  });

  it("does not return Access-Control-Allow-Origin for untrusted origin", async () => {
    const res = await appInstance.app.request("/products", {
      method: "GET",
      headers: {
        Origin: "http://untrusted-domain.com",
      },
    });

    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});
