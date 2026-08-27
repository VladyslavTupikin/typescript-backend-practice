import sqlite3 from "sqlite3";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { ReadAllProducts } from "./handlers/read-all.handler.js";
import { ReadOneProduct } from "./handlers/read-one.handler.js";
import { CreateProduct } from "./handlers/create-product.js";
import { UpdateProduct } from "./handlers/update.handler.js";

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

    const readOne = new ReadOneProduct(this.db);
    this.appHono.get("/products/:id", readOne.handle.bind(readOne));

    const createProduct = new CreateProduct(this.db);
    this.appHono.post("/products", createProduct.handle.bind(createProduct));

    const updateProduct = new UpdateProduct(this.db);
    this.appHono.patch(
      "/products/:id",
      updateProduct.handle.bind(updateProduct),
    );
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

  public get app(): Hono {
    return this.appHono;
  }
}
