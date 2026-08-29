// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import sqlite3 from "sqlite3";
import { Application } from "../app.js";

describe("Application", () => {
  it("should success when database only parameter passed to the constructor", async () => {
    const db = new sqlite3.Database(":memory:");
    const app = new Application(db);

    expect(app).instanceOf(Application);
  });

  it("should success when proper parameters passed to the constructor", async () => {
    const db = new sqlite3.Database(":memory:");
    const app = new Application(db, "192.168.1.2", 5000, "192.168.1.3", 3000);

    expect(app).instanceOf(Application);
  });

  it("should throw error when invalid IPv4 passed to the constructor", async () => {
    const invalidIPv4 = "257.786.12.21";
    const port = 4000;
    const validIPv4 = "127.0.0.1";
    const clientPort = 6000;
    const db = new sqlite3.Database(":memory:");

    const expectedMessage =
      "Error: invalid IPv4 address: server -  257.786.12.21 client - 127.0.0.1.";

    expect(
      () => new Application(db, invalidIPv4, port, validIPv4, clientPort),
    ).toThrow(expectedMessage);
  });

  it("should throw error when invalid database passed to the constructor", async () => {
    const validIPv4 = "192.168.1.1";
    const port = 4000;
    const clientPort = 6000;

    const expectedMessage = "Error: Invalid database parameter.";

    expect(
      () =>
        new Application(
          null as unknown as sqlite3.Database,
          validIPv4,
          port,
          validIPv4,
          clientPort,
        ),
    ).toThrow(expectedMessage);

    expect(
      () =>
        new Application(
          undefined as unknown as sqlite3.Database,
          validIPv4,
          port,
          validIPv4,
          clientPort,
        ),
    ).toThrow(expectedMessage);
  });

  it("should throw error when invalid port number passed to the constructor", async () => {
    const validIPv4 = "192.168.1.1";
    const invalidPort = 67898;
    const clientPort = 6000;
    const db = new sqlite3.Database(":memory:");

    const expectedMessage =
      "Error: port: 67898 or client_port: 6000 is out of range from 1 to 65535";

    expect(
      () => new Application(db, validIPv4, invalidPort, validIPv4, clientPort),
    ).toThrow(expectedMessage);
  });

  it("should throw error when invalid client port number passed to the constructor", async () => {
    const validIPv4 = "192.168.1.1";
    const validPort = 5000;
    const invalidClientPort = 89765;
    const db = new sqlite3.Database(":memory:");

    const expectedMessage =
      "Error: port: 5000 or client_port: 89765 is out of range from 1 to 65535";

    expect(
      () =>
        new Application(db, validIPv4, validPort, validIPv4, invalidClientPort),
    ).toThrow(expectedMessage);
  });
});
