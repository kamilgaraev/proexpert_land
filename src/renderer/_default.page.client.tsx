import { useEffect, type ComponentType, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import type { PageContextClient } from "vite-plugin-ssr/types";
import { PageShell } from "./PageShell";
import { preparePageShell } from "./pageShellLoader";
import { BrowserRouter } from "react-router-dom";

type ClientPageContext = Pick<
  PageContextClient,
  "Page" | "urlPathname" | "urlOriginal" | "isHydration"
> & {
  pageProps?: Record<string, unknown>;
};

export const clientRouting = true;

let root: Root | undefined;
let renderGeneration = 0;
let pendingCommit: Promise<void> = Promise.resolve();
let finishPendingCommit: (() => void) | undefined;

function handleUncaughtError(error: unknown) {
  finishPendingCommit?.();
  console.error("Unable to render page", error);
}

function ClientCommit({
  children,
  onCommit,
}: {
  children: ReactNode;
  onCommit: () => void;
}) {
  useEffect(onCommit, [onCommit]);
  return children;
}

export async function render(pageContext: ClientPageContext) {
  const generation = ++renderGeneration;
  await preparePageShell(pageContext.urlPathname || window.location.pathname);
  await pendingCommit;
  if (generation !== renderGeneration) return;

  const Page = pageContext.Page as ComponentType<Record<string, unknown>>;
  const pageProps = pageContext.pageProps;
  const container = document.getElementById("root");
  if (!container) throw new Error("Missing root element");

  let onCommit!: () => void;
  pendingCommit = new Promise<void>((resolve) => {
    onCommit = resolve;
    finishPendingCommit = resolve;
  });
  const page = (
    <ClientCommit onCommit={onCommit}>
      <BrowserRouter key={pageContext.urlOriginal || window.location.href}>
        <PageShell pageContext={pageContext}>
          <Page {...pageProps} />
        </PageShell>
      </BrowserRouter>
    </ClientCommit>
  );

  try {
    if (root) {
      root.render(page);
    } else if (pageContext.isHydration && container.hasChildNodes()) {
      root = hydrateRoot(container, page, {
        onUncaughtError: handleUncaughtError,
      });
    } else {
      root = createRoot(container, { onUncaughtError: handleUncaughtError });
      root.render(page);
    }
  } catch (error) {
    finishPendingCommit?.();
    throw error;
  }
  await pendingCommit;
}
