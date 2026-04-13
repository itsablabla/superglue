"use client";

import { useState, useEffect } from "react";

interface IOSInstallBannerProps {
  className?: string;
}

const DISMISS_KEY = "garza-glue-ios-install-dismissed";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day
const SHOW_DELAY_MS = 30000; // 30 seconds of usage before prompting

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function IOSInstallBanner({ className }: IOSInstallBannerProps): React.ReactElement | null {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIOSSafari() || isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;
    }

    const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (): void => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 pb-[env(safe-area-inset-bottom,16px)] bg-zinc-900 border-t border-zinc-700 animate-in slide-in-from-bottom duration-300 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3 max-w-lg mx-auto">
        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
          <span className="text-black font-black text-lg">GG</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Install Garza Glue</p>
          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
            Tap{" "}
            <svg
              className="inline w-4 h-4 -mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>{" "}
            then <strong>&quot;Add to Home Screen&quot;</strong>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-zinc-500 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
