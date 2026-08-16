"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVessel } from "../api";
import { useVessels } from "../vessels-context";

export function VesselsSection() {
  const { vessels, loading, error: loadError, refreshVessels } = useVessels();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const error = saveError ?? loadError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      await createVessel(trimmed);
      await refreshVessels();
      setName("");
    } catch {
      setSaveError("Failed to register vessel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
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
