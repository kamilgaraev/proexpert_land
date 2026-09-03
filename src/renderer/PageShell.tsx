import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isMarketingPublicPath } from "@/utils/publicSite";
import {
  getPrivatePageShell,
  loadPrivatePageShell,
  type PrivateShellComponent,
} from "./pageShellLoader";
import "../index.css";

interface PageShellProps {
  children: React.ReactNode;
  pageContext?: {
    urlPathname?: string;
  };
}

export function PageShell({ children }: PageShellProps) {
  const { pathname } = useLocation();
  const isPublic = isMarketingPublicPath(pathname);
  const [PrivateShell, setPrivateShell] =
    useState<PrivateShellComponent | null>(getPrivatePageShell);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isPublic || PrivateShell) {
      return;
    }

    let active = true;
    setFailed(false);
    loadPrivatePageShell().then(
      (Shell) => {
        if (active) setPrivateShell(() => Shell);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [isPublic, PrivateShell, attempt]);

  if (isPublic) {
    return <React.StrictMode>{children}</React.StrictMode>;
  }

  if (!PrivateShell) {
    return (
      <main className="grid min-h-screen place-content-center gap-4 p-8 text-center">
        {failed ? (
          <div role="alert">
            <p>Не удалось открыть страницу.</p>
            <button
              className="mt-4 underline"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Повторить
            </button>
          </div>
        ) : (
          <p role="status">Открываем страницу…</p>
        )}
      </main>
    );
  }

  return (
    <React.StrictMode>
      <PrivateShell>{children}</PrivateShell>
    </React.StrictMode>
  );
}
