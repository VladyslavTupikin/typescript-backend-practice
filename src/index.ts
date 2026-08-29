// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { Application } from "./app.js";
import sqlite3 from "sqlite3";
import process from "node:process";
import { parseArgs } from "node:util";

try {
  process.loadEnvFile();
} catch (error) {
  console.info("Could not load .env file, continue with default parameters.");
}

const options = {
  server_ip: {
    type: "string",
    default: "0.0.0.0",
  },

  server_port: {
    type: "string",
    default: "5000",
  },

  client_ip: {
    type: "string",
    default: "127.0.0.1",
  },

  client_port: {
    type: "string",
    default: "3000",
  },
} as const;

const { values, positionals } = parseArgs({
  options,
  allowPositionals: true,
  strict: true,
});

const serverIpArg = values.server_ip;
const serverPortArg = parseInt(values.server_port, 10);
const clientIpArg = values.client_ip;
const clientPortArg = parseInt(values.client_port, 10);

const SERVER_IP = process.env.SERVER_IP ?? serverIpArg;
const SERVER_PORT = Number(process.env.SERVER_PORT ?? serverPortArg);
const CLIENT_IP = process.env.CLIENT_IP ?? clientIpArg;
const CLIENT_PORT = Number(process.env.CLIENT_PORT ?? clientPortArg);

const dbPath = "./products.db";
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    throw Error(`Failed to load database ${dbPath}, error: ${err}. Exiting...`);
  }
});

const app = new Application(db, SERVER_IP, SERVER_PORT, CLIENT_IP, CLIENT_PORT);

app.Run();
