import { describe, expect, it } from "vitest";
import type { InjectFilterEntry } from "vike/types";
import sansCyrillic from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxaKYbABA.woff2?url";
import sansLatin from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2?url";
import { filterMarketingAssets } from "./marketingAssetFilter";

const asset = (
  src: string,
  assetType: InjectFilterEntry["assetType"],
  isEntry = false,
): InjectFilterEntry => ({
  src,
  assetType,
  isEntry,
  mediaType: assetType === "font" ? "font/woff2" : null,
  inject: "HTML_BEGIN",
});

describe("marketing font preload policy", () => {
  it("keeps the two primary subsets and disables extra font preloads in place", () => {
    const entries = [
      asset(sansCyrillic, "font"),
      asset(sansLatin, "font"),
      asset("/assets/plex-mono.woff2", "font"),
      asset("/assets/plex-greek.woff2", "font"),
    ];
    const originalExtra = entries[2];
    expect(filterMarketingAssets(entries)).toBeUndefined();
    expect(entries.map(({ inject }) => inject)).toEqual([
      "HTML_BEGIN",
      "HTML_BEGIN",
      false,
      false,
    ]);
    expect(entries[2]).toBe(originalExtra);
    expect(entries).toHaveLength(4);
  });

  it("preserves entry assets and every non-font injection decision", () => {
    const entries = [
      asset("/assets/entry-font.woff2", "font", true),
      asset("/assets/entry.css", "style", true),
      asset("/assets/entry.js", "script", true),
      asset("/assets/chunk.js", "script"),
      asset("/assets/hero.webp", "image"),
      asset("/assets/other", null),
    ];
    entries[3].inject = "HTML_END";
    entries[5].inject = false;
    const before = entries.map((entry) => ({ ...entry }));
    filterMarketingAssets(entries);
    expect(entries).toEqual(before);
  });
});
