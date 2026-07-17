import { describe, expect, it } from "vitest";
import publishedBlogTitles from "./fixtures/publishedBlogTitles.json";
import { marketingBlogArticles } from "./blogArticles";

describe("marketing blog article registry", () => {
  it("contains exactly the five published canonical article paths", () => {
    const expectedPaths = [
      "/blog/kak-prorabu-derzhat-obekt-bez-haosa",
      "/blog/chto-dolzhno-byt-u-pto-v-odnoy-sisteme",
      "/blog/chto-rukovoditel-stroitelstva-dolzhen-videt-kazhdoe-utro",
      "/blog/kak-snabzhentsu-perestat-sobirat-zayavki-iz-chatov",
      "/blog/kak-kontrolirovat-podryadchikov-na-obekte-bez-razborok",
    ];

    expect(
      Object.values(marketingBlogArticles)
        .map(({ href }) => href)
        .sort(),
    ).toEqual(expectedPaths.sort());
  });

  it("uses the exact titles returned by the production public API", () => {
    const registryTitles = Object.fromEntries(
      Object.values(marketingBlogArticles).map(({ href, title }) => [
        href.replace("/blog/", ""),
        title,
      ]),
    );

    expect(registryTitles).toEqual(publishedBlogTitles);
  });
});
