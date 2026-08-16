"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSession } from "@/features/auth/session-context";
import { createUser, fetchRoles } from "../api";
import { ASSIGNABLE_ROLES, type UserRole } from "../types";

export function UsersSection() {
  const { users, refreshUsers } = useSession();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchRoles()
      .then((fetched) => {
        if (cancelled) return;
        const assignable = fetched.filter((role) =>
          (ASSIGNABLE_ROLES as readonly string[]).includes(role.name),
        );
        setRoles(assignable);
        setRoleId((current) => current ?? assignable[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load roles.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || roleId === null || saving) return;

    setSaving(true);
    setError(null);
    try {
      await createUser(trimmed, roleId);
      await refreshUsers();
      setName("");
    } catch (cause) {
      setError(
        (cause as { code?: string }).code === "23505"
          ? "A member with that name is already enlisted."
          : "Failed to enlist member.",
      );
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
          placeholder="e.g. Diego Silang"
          aria-label="Member name"
          maxLength={100}
          className="w-full sm:w-72"
        />
        <Select
          value={roleId ?? ""}
          disabled={roles.length === 0}
          aria-label="Role"
          onChange={(event) => setRoleId(Number(event.target.value))}
        >
          {roles.length === 0 && <option value="">Loading…</option>}
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={saving || !name.trim() || roleId === null}>
          {saving ? "Enlisting…" : "Enlist member"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <ul className="mt-4 border-t border-rule">
        {users.length === 0 && (
          <li className="py-2 text-sm italic text-muted">No members enlisted.</li>
        )}
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
          >
            <span className="text-lg">{user.name}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {user.role}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
