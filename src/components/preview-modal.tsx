"use client";

import { useState } from "react";

interface Props {
  fullButton?: boolean;
  outline?: boolean;
}

export function PreviewModal({ fullButton = false, outline = false }: Props) {
  const [open, setOpen] = useState(false);

  const btnBase = "inline-flex items-center gap-2 rounded-lg text-sm font-semibold transition-colors";

  const btnStyle = fullButton
    ? `${btnBase} bg-zinc-800 px-6 py-3 text-zinc-100 hover:bg-zinc-700 border border-zinc-700`
    : outline
    ? `${btnBase} border border-zinc-700 px-6 py-3 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-500`
    : `${btnBase} border border-zinc-700 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800`;

  return (
    <>
      <button onClick={() => setOpen(true)} className={btnStyle}>
        <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        {fullButton ? "Preview App" : "Preview"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                    <circle cx="12" cy="12" r="9" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /><circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-zinc-200">Dope Card Buddy — Demo Preview</span>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  Preview Only
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="#signin"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
                >
                  Get Full Access →
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  aria-label="Close preview"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* iframe */}
            <div className="relative flex-1 overflow-hidden">
              <iframe
                src="/demo/dope-card-buddy-demo.html"
                title="Dope Card Buddy demo"
                className="h-full w-full bg-zinc-950"
              />
              {/* Subtle bottom fade hinting there's more */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/60 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
