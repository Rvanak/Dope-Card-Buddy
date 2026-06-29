"use client";

import { FormEvent, useState } from "react";
import { TurnstileTokenField } from "@/components/turnstile-token-field";

export function RedeemAccessCode() {
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/access/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, turnstileToken }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Could not redeem code.");
        return;
      }

      const until = new Date(body.grantedUntil);
      setMessage(`Access granted until ${until.toLocaleString()}.`);
      setCode("");
      window.location.href = "/app";
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold">Redeem 24-Hour Access Code</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Enter a code from an admin to unlock temporary access without purchasing.
      </p>

      <form className="mt-4 flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter access code"
          required
        />
        <button
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
          type="submit"
          disabled={loading || (turnstileEnabled && !turnstileToken)}
        >
          {loading ? "Redeeming..." : "Redeem"}
        </button>
      </form>
      <TurnstileTokenField onToken={setTurnstileToken} />

      {message ? <p className="mt-3 text-sm text-emerald-400">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
