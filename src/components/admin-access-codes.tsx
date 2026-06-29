"use client";

import { useState } from "react";

type Redemption = {
  user: { email: string };
  redeemedAt: string | Date;
  grantedUntil: string | Date;
};

type AccessCode = {
  id: string;
  code: string;
  expiresAt: string | Date;
  grantHours: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string | Date;
  redemptions: Redemption[];
};

type AdminAccessCodesProps = {
  initialCodes: AccessCode[];
};

export function AdminAccessCodes({ initialCodes }: AdminAccessCodesProps) {
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [grantHours, setGrantHours] = useState(24);
  const [maxUses, setMaxUses] = useState(1);
  const [validHours, setValidHours] = useState(24);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCodes = async () => {
    const response = await fetch("/api/admin/access-codes");
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error ?? "Failed to load codes.");
    }
    setCodes(body.codes);
  };

  const onToggleActive = async (code: AccessCode) => {
    setTogglingId(code.id);
    try {
      const response = await fetch("/api/admin/access-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: code.id, isActive: !code.isActive }),
      });
      if (!response.ok) return;
      setCodes((prev) =>
        prev.map((c) => (c.id === code.id ? { ...c, isActive: !code.isActive } : c)),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setCreatedCode(null);

    try {
      const response = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantHours, maxUses, validHours }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Could not generate code.");
        return;
      }

      setCreatedCode(body.code);
      await loadCodes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Generate Access Code</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Create a passcode that unlocks access without Stripe for a fixed time.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="text-zinc-300">Grant hours</span>
            <input
              type="number"
              min={1}
              max={168}
              value={grantHours}
              onChange={(event) => setGrantHours(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-300">Max uses</span>
            <input
              type="number"
              min={1}
              max={100}
              value={maxUses}
              onChange={(event) => setMaxUses(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-300">Code valid hours</span>
            <input
              type="number"
              min={1}
              max={720}
              value={validHours}
              onChange={(event) => setValidHours(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        </div>

        <button
          className="mt-4 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
          disabled={loading}
          onClick={onGenerate}
          type="button"
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>

        {createdCode ? (
          <p className="mt-3 text-sm text-emerald-400">
            New code: <span className="font-mono font-semibold">{createdCode}</span>
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Recent Codes</h2>
        <div className="mt-4 space-y-3">
          {codes.map((code) => {
            const expired = new Date(code.expiresAt).getTime() <= Date.now();
            return (
              <div key={code.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-amber-300">{code.code}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        expired
                          ? "bg-zinc-800 text-zinc-500"
                          : code.isActive
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {expired ? "expired" : code.isActive ? "active" : "inactive"}
                    </span>
                    {!expired && (
                      <button
                        type="button"
                        disabled={togglingId === code.id}
                        onClick={() => onToggleActive(code)}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                          code.isActive
                            ? "bg-red-900/40 text-red-400 hover:bg-red-900/70"
                            : "bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70"
                        }`}
                      >
                        {togglingId === code.id
                          ? "..."
                          : code.isActive
                          ? "Deactivate"
                          : "Reactivate"}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Uses: {code.usedCount}/{code.maxUses} | Grants {code.grantHours}h | Expires{" "}
                  {new Date(code.expiresAt).toLocaleString()}
                </p>
                {code.redemptions.length > 0 ? (
                  <div className="mt-2 text-xs text-zinc-400">
                    Last redemption: {code.redemptions[0].user.email} at{" "}
                    {new Date(code.redemptions[0].redeemedAt).toLocaleString()}
                  </div>
                ) : null}
              </div>
            );
          })}
          {codes.length === 0 ? <p className="text-sm text-zinc-400">No codes yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
