import type { InjectFilterEntry } from "vike/types";
import sansCyrillic from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxaKYbABA.woff2?url";
import sansLatin from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2?url";

const priorityFonts = new Set([sansCyrillic, sansLatin]);

export function filterMarketingAssets(assets: InjectFilterEntry[], inlineHomeStyles = false): void {
  for (const asset of assets) {
    if (
      inlineHomeStyles &&
      asset.assetType === "style" &&
      /\/src_index-[^/]+\.css$/.test(asset.src)
    ) {
      asset.inject = false;
    }
    if (
      asset.assetType === "font" &&
      !asset.isEntry &&
      !priorityFonts.has(asset.src)
    ) {
      asset.inject = false;
    }
  }
}
