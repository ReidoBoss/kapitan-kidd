"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerList } from "@/components/ui/ledger-list";
import { Select } from "@/components/ui/select";
import { useSession } from "@/features/auth/session-context";
import { useMutation } from "@/lib/hooks/use-mutation";
import { useQuery } from "@/lib/hooks/use-query";
import { createUser, fetchRoles } from "../api";
import { assignableRolesOf } from "../derive";

const enlistErrorMessage = (cause: unknown) =>
  (cause as { code?: string }).code === "23505"
    ? "A member with that name is already enlisted."
    : "Failed to enlist member.";

export function UsersSection() {
  const { users, refreshUsers } = useSession();
  const rolesQuery = useQuery(fetchRoles, [], "Failed to load roles.");
  const roles = assignableRolesOf(rolesQuery.data ?? []);

  const [name, setName] = useState("");
  const [pickedRoleId, setPickedRoleId] = useState<number | null>(null);
  const roleId = pickedRoleId ?? roles[0]?.id ?? null;

  const enlist = useMutation(createUser, {
    onSuccess: async () => {
      await refreshUsers();
    },
    errorMessage: enlistErrorMessage,
  });

  const error = enlist.error ?? rolesQuery.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed && roleId !== null && (await enlist.run(trimmed, roleId))) {
      setName("");
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
          placeholder="e.g. Diego Silang"
          aria-label="Member name"
          maxLength={100}
          className="w-full sm:w-72"
        />
        <Select
          value={roleId ?? ""}
          disabled={roles.length === 0}
          aria-label="Role"
          onChange={(event) => setPickedRoleId(Number(event.target.value))}
        >
          {roles.length === 0 && <option value="">Loading…</option>}
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          disabled={enlist.busy || !name.trim() || roleId === null}
        >
          {enlist.busy ? "Enlisting…" : "Enlist member"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <LedgerList
        items={users}
        getKey={(user) => user.id}
        emptyText="No members enlisted."
        renderItem={(user) => (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-lg">{user.name}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {user.role}
            </span>
          </div>
        )}
      />
    </section>
  );
}
