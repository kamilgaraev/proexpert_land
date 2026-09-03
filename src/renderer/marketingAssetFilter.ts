import type { InjectFilterEntry } from "vite-plugin-ssr/types";
import sansCyrillic from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxaKYbABA.woff2?url";
import sansLatin from "@/assets/fonts/ibm-plex/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2?url";

const priorityFonts = new Set([sansCyrillic, sansLatin]);

export function filterMarketingAssets(assets: InjectFilterEntry[]): void {
  for (const asset of assets) {
    if (
      asset.assetType === "font" &&
      !asset.isEntry &&
      !priorityFonts.has(asset.src)
    ) {
      asset.inject = false;
    }
  }
}
