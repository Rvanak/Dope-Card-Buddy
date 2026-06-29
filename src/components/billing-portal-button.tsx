"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch("/api/stripe/portal", { method: "POST" });
            const body = await response.json();
            if (!response.ok || !body.url) {
              setError(body.error ?? "Unable to open billing portal.");
              return;
            }
            window.location.href = body.url;
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Opening..." : "Manage Billing"}
      </button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
