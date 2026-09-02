import { describe, expect, it } from "vitest";
import publishedBlogTitles from "./fixtures/publishedBlogTitles.json";
import { marketingBlogArticles } from "./blogArticles";

describe("marketing blog article registry", () => {
  it("does not restore links to archived articles returning 404", () => {
    const archivedPaths = new Set([
      "/blog/kak-prorabu-derzhat-obekt-bez-haosa",
      "/blog/chto-dolzhno-byt-u-pto-v-odnoy-sisteme",
      "/blog/chto-rukovoditel-stroitelstva-dolzhen-videt-kazhdoe-utro",
      "/blog/kak-snabzhentsu-perestat-sobirat-zayavki-iz-chatov",
      "/blog/kak-kontrolirovat-podryadchikov-na-obekte-bez-razborok",
    ]);

    for (const { href } of Object.values(marketingBlogArticles)) {
      expect(archivedPaths.has(href)).toBe(false);
    }
  });

  it("matches published headings verified by the production crawl on 2026-09-03", () => {
    const registryTitles = Object.fromEntries(
      Object.values(marketingBlogArticles).map(({ href, title }) => [
        href.replace("/blog/", ""),
        title,
      ]),
    );

    expect(registryTitles).toEqual(publishedBlogTitles);
  });
});
