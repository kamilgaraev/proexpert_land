import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const { respondWithSitemap } = require("../../server/sitemap.cjs") as {
  respondWithSitemap: (
    response: {
      writeHead: ReturnType<typeof vi.fn>;
      end: ReturnType<typeof vi.fn>;
    },
    options: { fetchImpl: typeof fetch },
  ) => Promise<void>;
};

const makeResponse = () => ({ writeHead: vi.fn(), end: vi.fn() });

const jsonFetch = (body: unknown, status = 200) =>
  vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sitemap availability", () => {
  it("publishes articles and a cacheable XML response after a successful API response", async () => {
    const response = makeResponse();
    await respondWithSitemap(response, {
      fetchImpl: jsonFetch({
        success: true,
        data: [{ slug: "plan-fakt-v-stroitelstve" }],
      }),
    });
    expect(response.writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": expect.stringContaining("max-age=900"),
      }),
    );
    expect(response.end).toHaveBeenCalledWith(
      expect.stringContaining("/blog/plan-fakt-v-stroitelstve</loc>"),
    );
  });

  it.each([
    ["upstream failure", { success: false }, 503],
    ["malformed article envelope", { success: true }, 200],
    ["explicit API rejection", { success: false, data: [] }, 200],
  ])(
    "does not publish a partial sitemap on %s",
    async (_label, body, status) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const response = makeResponse();
      await respondWithSitemap(response, {
        fetchImpl: jsonFetch(body, status),
      });
      expect(response.writeHead).toHaveBeenCalledWith(
        503,
        expect.objectContaining({
          "Cache-Control": "no-store",
          "Retry-After": "300",
        }),
      );
      expect(response.end).not.toHaveBeenCalledWith(
        expect.stringContaining("<urlset"),
      );
    },
  );

  it("returns a retryable response when the API connection fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = makeResponse();
    await respondWithSitemap(response, {
      fetchImpl: vi
        .fn<typeof fetch>()
        .mockRejectedValue(new TypeError("network unavailable")),
    });
    expect(response.writeHead.mock.calls[0][0]).toBe(503);
    expect(response.end).toHaveBeenCalledTimes(1);
  });

  it("accepts an explicitly empty published article list", async () => {
    const response = makeResponse();
    await respondWithSitemap(response, {
      fetchImpl: jsonFetch({ success: true, data: [] }),
    });
    expect(response.writeHead.mock.calls[0][0]).toBe(200);
    expect(response.end.mock.calls[0][0]).toContain("<urlset");
  });
});
