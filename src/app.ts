import sqlite3 from "sqlite3";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { ReadAllProducts } from "./handlers/read-all.handler.js";

export class Application {
  private appHono: Hono;
  constructor(
    private db: sqlite3.Database,
    private host: string = "127.0.0.1",
    private port: number = 5000,
    private clientPort: number = 3000,
  ) {
    this.appHono = new Hono();

    this.Initialize();
  }

  private Initialize(): void {
    this.appHono.use(
      "*",
      cors({
        origin: `http://${this.host}:${this.clientPort}`,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowHeaders: ["Content-Type"],
      }),
    );

    const readAll = new ReadAllProducts(this.db);
    this.appHono.get("/products", readAll.handle.bind(readAll));
  }

  public Run(): void {
    serve(
      {
        fetch: this.appHono.fetch,
        port: this.port,
        hostname: this.host,
      },
      (info) => {
        console.log(`Server running ${info.address}:${info.port}`);
      },
    );
  }
}
