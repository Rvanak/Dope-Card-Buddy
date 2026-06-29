"use client";

import { useEffect, useState } from "react";

type Drawing = {
  id: string;
  caliberInch: number;
  cartridgeName: string;
  saamiUrl: string | null;
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
};

const CALIBERS = [
  { label: ".144 (.14-222)", value: 0.144 },
  { label: ".172 (.17 cal)", value: 0.172 },
  { label: ".196 (.19 wildcat)", value: 0.196 },
  { label: ".204 (.204 Ruger)", value: 0.204 },
  { label: ".224 (.22 / 5.56mm)", value: 0.224 },
  { label: ".243 (6mm)", value: 0.243 },
  { label: ".257 (.25 cal)", value: 0.257 },
  { label: ".264 (6.5mm)", value: 0.264 },
  { label: ".277 (.270 cal)", value: 0.277 },
  { label: ".284 (7mm)", value: 0.284 },
  { label: ".308 (.30 cal)", value: 0.308 },
  { label: ".311/.312 (.303 / 7.62×39)", value: 0.311 },
  { label: ".323 (8mm Mauser)", value: 0.323 },
  { label: ".338", value: 0.338 },
  { label: ".348 (.348 Win)", value: 0.348 },
  { label: ".357/.358 (.35 cal)", value: 0.358 },
  { label: ".357 (.350 Legend / .360 Buck)", value: 0.357 },
  { label: ".366 (9.3mm)", value: 0.366 },
  { label: ".375 (.375 H&H family)", value: 0.375 },
  { label: ".408 (.408 CheyTac)", value: 0.408 },
  { label: ".416 (.416 Rigby family)", value: 0.416 },
  { label: ".423 (.404 Jeffery)", value: 0.423 },
  { label: ".430 (.444 Marlin)", value: 0.430 },
  { label: ".452 (.450 Bushmaster)", value: 0.452 },
  { label: ".458 (.458 Win Mag family)", value: 0.458 },
  { label: ".510 (.50 BMG)", value: 0.510 },
];

export default function AdminDrawingsPage() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCal, setFilterCal] = useState<number | "all">("all");

  // New drawing form
  const [newCal, setNewCal] = useState(0.308);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/chamber-drawings");
    const data = (await res.json()) as { drawings: Drawing[] };
    setDrawings(data.drawings ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function addDrawing() {
    if (!newName.trim()) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/chamber-drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caliberInch: newCal, cartridgeName: newName, saamiUrl: newUrl, notes: newNotes }),
    });
    if (res.ok) {
      setNewName(""); setNewUrl(""); setNewNotes("");
      setMessage("Added.");
      await load();
    } else {
      const d = (await res.json()) as { error?: string };
      setMessage(d.error ?? "Error.");
    }
    setSaving(false);
  }

  async function toggleActive(drawing: Drawing) {
    await fetch("/api/admin/chamber-drawings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: drawing.id, isActive: !drawing.isActive }),
    });
    await load();
  }

  async function deleteDrawing(id: string) {
    if (!confirm("Delete this drawing entry?")) return;
    await fetch(`/api/admin/chamber-drawings?id=${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = filterCal === "all" ? drawings : drawings.filter((d) => d.caliberInch === filterCal);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chamber Drawings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage SAAMI cartridge chamber drawing links by caliber.</p>
      </div>

        {/* Add new */}
        <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">Add Drawing</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Caliber</label>
              <select
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                value={newCal}
                onChange={(e) => setNewCal(parseFloat(e.target.value))}
              >
                {CALIBERS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Cartridge Name</label>
              <input
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. .308 Winchester"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-zinc-400">SAAMI Drawing URL</label>
              <input
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="https://saami.org/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-zinc-400">Notes (optional)</label>
              <input
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. Headspace note, standard reference..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
          </div>
          <button
            className="mt-4 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
            disabled={saving || !newName.trim()}
            onClick={addDrawing}
          >
            {saving ? "Saving..." : "Add Drawing"}
          </button>
          {message && <p className="mt-2 text-sm text-amber-300">{message}</p>}
        </section>

        {/* Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-md border px-3 py-1 text-xs ${filterCal === "all" ? "border-amber-500 text-amber-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
            onClick={() => setFilterCal("all")}
          >
            All ({drawings.length})
          </button>
          {CALIBERS.map((c) => {
            const count = drawings.filter((d) => d.caliberInch === c.value).length;
            return (
              <button
                key={c.value}
                className={`rounded-md border px-3 py-1 text-xs ${filterCal === c.value ? "border-amber-500 text-amber-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                onClick={() => setFilterCal(c.value)}
              >
                {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-left text-xs uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Caliber</th>
                  <th className="px-4 py-3">Cartridge</th>
                  <th className="px-4 py-3">SAAMI Link</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((d) => (
                  <tr key={d.id} className={`${d.isActive ? "" : "opacity-40"} hover:bg-zinc-900/50`}>
                    <td className="px-4 py-3 font-mono text-amber-400">.{String(Math.round(d.caliberInch * 1000)).padStart(3, "0")}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{d.cartridgeName}</td>
                    <td className="px-4 py-3">
                      {d.saamiUrl ? (
                        <a href={d.saamiUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-300 underline hover:text-amber-200">
                          SAAMI ↗
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-zinc-400">{d.notes ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(d)}
                        className={`rounded px-2 py-0.5 text-xs font-medium ${d.isActive ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}
                      >
                        {d.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteDrawing(d.id)}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
