// Copyright (c) 2026 Vladyslav Tupikin
// Authorship: Generated with Google Gemini 2.5 Flash
// SPDX-License-Identifier: ISC

import { describe, it, expect, vi, beforeEach } from "vitest";
import { serve } from "@hono/node-server";
import { Application } from "../app.js";

vi.mock("@hono/node-server", () => ({
  serve: vi.fn(),
}));

describe("Application - Run()", () => {
  let appInstance: Application;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = {} as any;
    appInstance = new Application(mockDb, "127.0.0.1", 5000, 3000);
  });

  it("passes correct configuration to serve()", () => {
    appInstance.Run();

    expect(serve).toHaveBeenCalledTimes(1);
    expect(serve).toHaveBeenCalledWith(
      {
        fetch: expect.any(Function),
        port: 5000,
        hostname: "127.0.0.1",
      },
      expect.any(Function),
    );
  });

  it("executes the listen callback and logs server startup info", () => {
    vi.mocked(serve).mockImplementationOnce((options, cb) => {
      if (cb) {
        cb({ address: "127.0.0.1", port: 5000, family: "IPv4" } as any);
      }
      return {} as any;
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appInstance.Run();

    expect(consoleSpy).toHaveBeenCalledWith("Server running 127.0.0.1:5000");
    consoleSpy.mockRestore();
  });
});
