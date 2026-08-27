import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, OfflineError } from "./api";

describe("apiFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(new Response("{}"));
    localStorage.clear();
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("rejects with OfflineError without calling fetch when offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    await expect(apiFetch("/anything")).rejects.toBeInstanceOf(OfflineError);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls fetch with an X-Language header derived from localStorage", async () => {
    localStorage.setItem("lang", "fr");

    await apiFetch("/health");

    expect(global.fetch).toHaveBeenCalledWith(
      "/health",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Language": "FR" }),
      }),
    );
  });

  it("defaults to EN when no language is stored", async () => {
    await apiFetch("/health");

    expect(global.fetch).toHaveBeenCalledWith(
      "/health",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Language": "EN" }),
      }),
    );
  });

  it("preserves caller-supplied headers alongside the language header", async () => {
    await apiFetch("/health", { headers: { Authorization: "Bearer x" } });

    expect(global.fetch).toHaveBeenCalledWith(
      "/health",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer x",
          "X-Language": "EN",
        }),
      }),
    );
  });
});
