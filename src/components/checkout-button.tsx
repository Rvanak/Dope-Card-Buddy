"use client";

import { useState } from "react";

type BillingType = "monthly" | "one_time";

type CheckoutButtonProps = {
  billingType: BillingType;
  buttonLabel: string;
};

export function CheckoutButton({ billingType, buttonLabel }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch("/api/stripe/checkout", {
              credentials: "include",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ billingType }),
            });
            const body = (await response.json()) as { url?: string; error?: string };
            if (!response.ok || !body.url) {
              setError(body.error ?? `Checkout failed (${response.status}). Please try again.`);
              setLoading(false);
              return;
            }
            window.location.href = body.url;
          } catch {
            setError("Network error. Please check your connection and try again.");
            setLoading(false);
          }
        }}
      >
        {loading ? "Redirecting..." : buttonLabel}
      </button>
      {error ? (
        <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
