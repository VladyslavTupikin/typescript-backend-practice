import { Application } from "./app.js";
import sqlite3 from "sqlite3";
import process from "node:process";

try {
  process.loadEnvFile();
} catch (error) {
  console.info("Could not load .env file, continue with default parameters.");
}

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_PORT = Number(process.env.CLIENT_PORT ?? 5000);

const db = new sqlite3.Database(":memory:");
const app = new Application(db, HOST, PORT, CLIENT_PORT);

app.Run();
