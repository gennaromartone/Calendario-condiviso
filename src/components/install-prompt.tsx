"use client";

import { useState, useEffect } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  if (!isIOS) {
    return null;
  }

  return (
    <div
      role="banner"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
    >
      <div className="mx-auto flex max-w-md items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Aggiungi a schermata Home
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tocca il pulsante Condividi{" "}
            <span aria-hidden>⎋</span> e poi &quot;Aggiungi a schermata
            Home&quot; <span aria-hidden>➕</span> per installare l&apos;app.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Chiudi"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
