"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerList } from "@/components/ui/ledger-list";
import { useMutation } from "@/lib/hooks/use-mutation";
import { createVessel } from "../api";
import type { Vessel } from "../types";
import { useVessels } from "../vessels-context";

const registeredOn = (vessel: Vessel) =>
  new Date(vessel.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function VesselsSection() {
  const { vessels, loading, error: loadError, refreshVessels } = useVessels();
  const [name, setName] = useState("");

  const register = useMutation(createVessel, {
    onSuccess: refreshVessels,
    errorMessage: "Failed to register vessel.",
  });

  const error = register.error ?? loadError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed && (await register.run(trimmed))) setName("");
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
        <Button type="submit" disabled={register.busy || !name.trim()}>
          {register.busy ? "Registering…" : "Register vessel"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <LedgerList
        items={vessels}
        getKey={(vessel) => vessel.id}
        loading={loading}
        loadingText="Loading vessels…"
        emptyText="No vessels registered."
        renderItem={(vessel) => (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-lg">{vessel.name}</span>
            <span className="text-xs text-muted">
              Registered {registeredOn(vessel)}
            </span>
          </div>
        )}
      />
    </section>
  );
}
