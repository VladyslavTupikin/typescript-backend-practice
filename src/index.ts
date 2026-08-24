import { Application } from "./app.js";
import sqlite3, { PROTOCOL } from "sqlite3";
import process from "node:process";

try {
  process.loadEnvFile();
} catch (error) {
  console.info("Could not load .env file, continue with default parameters.");
}

const HOST = process.env.HOST;
const PORT = Number(process.env.PORT);
const CLIENT_PORT = Number(process.env.CLIENT_PORT);

const db = new sqlite3.Database(":memory:");
const app = new Application(db, HOST, PORT, CLIENT_PORT);

app.Run();
