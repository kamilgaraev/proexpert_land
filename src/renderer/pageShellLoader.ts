import type { ComponentType, PropsWithChildren } from "react";
import { isMarketingPublicPath } from "@/utils/publicSite";

export type PrivateShellComponent = ComponentType<PropsWithChildren>;

let privateShell: PrivateShellComponent | null = null;
let pendingShell: Promise<PrivateShellComponent> | null = null;

export const getPrivatePageShell = () => privateShell;

export function loadPrivatePageShell(): Promise<PrivateShellComponent> {
  if (privateShell) {
    return Promise.resolve(privateShell);
  }

  if (!pendingShell) {
    pendingShell = import("./PrivatePageShell")
      .then((module) => {
        privateShell = module.default;
        return privateShell;
      })
      .catch((error: unknown) => {
        pendingShell = null;
        throw error;
      });
  }

  return pendingShell;
}

export async function preparePageShell(pathname: string): Promise<void> {
  if (!isMarketingPublicPath(pathname)) {
    await loadPrivatePageShell();
  }
}
