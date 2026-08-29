// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import sqlite3 from "sqlite3";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { ReadAllProducts } from "./handlers/read-all.handler.js";
import { ReadOneProduct } from "./handlers/read-one.handler.js";
import { CreateProduct } from "./handlers/create-product.js";
import { UpdateProduct } from "./handlers/update.handler.js";
import { DeleteProduct } from "./handlers/delete-product.js";
import { isIPv4 } from "node:net";

export class Application {
  private appHono: Hono;
  constructor(
    private db: sqlite3.Database,
    private server: string = "127.0.0.1",
    private port: number = 5000,
    private client: string = "127.0.0.1",
    private clientPort: number = 3000,
  ) {
    if (!db) {
      throw new Error("Error: Invalid database parameter.");
    }

    if (!isIPv4(server) || !isIPv4(client)) {
      throw new Error(
        `Error: invalid IPv4 address: server -  ${server} client - ${client}.`,
      );
    }

    const portMax = 65535;
    const arePortsValidNumber = [port, clientPort].every(
      (p) => p > 0 && p <= portMax,
    );

    if (!arePortsValidNumber) {
      throw new Error(
        `Error: port: ${port} or client_port: ${clientPort} is out of range from 1 to 65535`,
      );
    }

    this.appHono = new Hono();

    this.Initialize();
  }

  private Initialize(): void {
    this.appHono.use(
      "*",
      cors({
        origin: `http://${this.client}:${this.clientPort}`,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowHeaders: ["Content-Type"],
      }),
    );

    const readAll = new ReadAllProducts(this.db);
    this.appHono.get("/products", readAll.handle.bind(readAll));

    const readOne = new ReadOneProduct(this.db);
    this.appHono.get("/products/:id", readOne.handle.bind(readOne));

    const createProduct = new CreateProduct(this.db);
    this.appHono.post("/products", createProduct.handle.bind(createProduct));

    const updateProduct = new UpdateProduct(this.db);
    this.appHono.patch(
      "/products/:id",
      updateProduct.handle.bind(updateProduct),
    );

    const deleteProduct = new DeleteProduct(this.db);
    this.appHono.delete(
      "/products/:id",
      deleteProduct.handle.bind(deleteProduct),
    );
  }

  public Run(): void {
    serve(
      {
        fetch: this.appHono.fetch,
        port: this.port,
        hostname: this.server,
      },
      (info) => {
        console.log(`Server running ${info.address}:${info.port}`);
      },
    );
  }

  public get app(): Hono {
    return this.appHono;
  }
}
