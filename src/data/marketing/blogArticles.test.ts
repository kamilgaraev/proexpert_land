import { describe, expect, it } from "vitest";
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

  it("keeps a substantial published title for every article", () => {
    expect(
      Object.values(marketingBlogArticles).every(
        ({ title }) => title.length > 20,
      ),
    ).toBe(true);
  });
});
