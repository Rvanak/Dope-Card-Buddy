"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  LEGAL_DISCLAIMER_LOCAL_STORAGE_KEY,
  LEGAL_DISCLAIMER_PARAGRAPHS,
  LEGAL_DISCLAIMER_REFERENCES,
  LEGAL_DISCLAIMER_TITLE,
  LEGAL_DISCLAIMER_VERSION,
} from "@/lib/legal-disclaimer";

type LegalDisclaimerGateProps = {
  initialAccepted: boolean;
  isSignedIn: boolean;
};

function loadAcceptedVersion() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LEGAL_DISCLAIMER_LOCAL_STORAGE_KEY);
}

function subscribeAcceptedVersion(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

async function persistServerAcceptance() {
  await fetch("/api/legal/accept", { method: "POST" });
}

export function LegalDisclaimerGate({ initialAccepted, isSignedIn }: LegalDisclaimerGateProps) {
  const [acceptedByClick, setAcceptedByClick] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const localAcceptedVersion = useSyncExternalStore(
    subscribeAcceptedVersion,
    loadAcceptedVersion,
    () => null,
  );
  const localAccepted = localAcceptedVersion === LEGAL_DISCLAIMER_VERSION;
  const accepted = initialAccepted || localAccepted || acceptedByClick;
  const gateOpen = !accepted || isOpen;

  useEffect(() => {
    if (!isSignedIn || !localAccepted || initialAccepted) return;
    void persistServerAcceptance();
  }, [initialAccepted, isSignedIn, localAccepted]);

  if (!gateOpen) {
    return (
      // suppressHydrationWarning prevents false positives from IDE browser injecting data-cursor-ref
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[90] rounded-md border border-zinc-700 bg-zinc-950/95 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-900"
      >
        View Legal Disclaimer
      </button>
    );
  }

  return (
    <div suppressHydrationWarning className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-3xl rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Required Before Use</p>
        <h2 className="mt-2 text-2xl font-bold">{LEGAL_DISCLAIMER_TITLE}</h2>
        <p className="mt-2 text-sm text-zinc-300">
          You must read and accept this disclaimer before accessing any feature on this site.
        </p>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
          {LEGAL_DISCLAIMER_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Helpful References</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEGAL_DISCLAIMER_REFERENCES.map((reference) => (
              <a
                key={reference.href}
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-amber-300 hover:bg-zinc-800"
              >
                {reference.label}
              </a>
            ))}
          </div>
        </div>

        {!accepted ? (
          <label className="mt-5 flex items-start gap-2 text-sm text-zinc-200">
            <input
              className="mt-0.5"
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <span>
              I have read and understood this disclaimer and I accept full responsibility for my
              actions, legal compliance, and firearm safety decisions.
            </span>
          </label>
        ) : null}

        {persistError ? <p className="mt-3 text-sm text-red-400">{persistError}</p> : null}

        {accepted ? (
          <button
            type="button"
            className="mt-5 rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        ) : (
          <button
            type="button"
            disabled={!checked}
            className="mt-5 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={async () => {
              window.localStorage.setItem(
                LEGAL_DISCLAIMER_LOCAL_STORAGE_KEY,
                LEGAL_DISCLAIMER_VERSION,
              );

              if (isSignedIn) {
                try {
                  await persistServerAcceptance();
                } catch {
                  setPersistError(
                    "Accepted locally, but we could not sync to your account yet. Please refresh after signing in.",
                  );
                }
              }

              setAcceptedByClick(true);
              setIsOpen(false);
            }}
          >
            Accept and Continue
          </button>
        )}
      </div>
    </div>
  );
}
