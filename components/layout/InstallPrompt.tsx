"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed in this session
    if (sessionStorage.getItem("pwa_prompt_dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't pop up immediately on first load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    sessionStorage.setItem("pwa_prompt_dismissed", "1");
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 px-4 py-3.5 flex items-center gap-3 animate-slide-up">
        {/* App icon */}
        <div className="w-11 h-11 bg-primary-800 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-extrabold text-sm leading-none">
            Moto<br /><span className="text-accent-400">Mart</span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Install MotoMart
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
            Add to home screen for faster access & offline browsing
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
