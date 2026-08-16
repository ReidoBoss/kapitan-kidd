"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVessel, fetchVessels } from "../api";
import type { Vessel } from "../types";

export function VesselsSection() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchVessels()
      .then((fetched) => {
        if (!cancelled) setVessels(fetched);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load vessels.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    try {
      const vessel = await createVessel(trimmed);
      setVessels((current) => [vessel, ...current]);
      setName("");
    } catch {
      setError("Failed to register vessel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        Vessel Registry
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. MV Visayas Pearl"
          aria-label="Vessel name"
          maxLength={100}
          className="w-full sm:w-72"
        />
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? "Registering…" : "Register vessel"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <ul className="mt-4 border-t border-rule">
        {loading && (
          <li className="py-2 text-sm italic text-muted">Loading vessels…</li>
        )}
        {!loading && vessels.length === 0 && (
          <li className="py-2 text-sm italic text-muted">
            No vessels registered.
          </li>
        )}
        {vessels.map((vessel) => (
          <li
            key={vessel.id}
            className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
          >
            <span className="text-lg">{vessel.name}</span>
            <span className="text-xs text-muted">
              Registered{" "}
              {new Date(vessel.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
