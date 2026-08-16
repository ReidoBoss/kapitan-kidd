"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { useSession } from "../session-context";
import { ROLES, type RoleName } from "../types";

export function UtilityBar() {
  const { users, activeUser, setActiveUser, loading, error } = useSession();
  const [pickedRole, setPickedRole] = useState<RoleName | null>(null);

  const selectedRole = pickedRole ?? activeUser?.role ?? "Admin";
  const members = users.filter((user) => user.role === selectedRole);
  const selectedMemberId =
    activeUser?.role === selectedRole ? activeUser.id : "";

  const handleRoleChange = (role: RoleName) => {
    setPickedRole(role);
    const firstMember = users.find((user) => user.role === role);
    if (firstMember) setActiveUser(firstMember);
  };

  const handleMemberChange = (userId: string) => {
    const member = members.find((user) => user.id === userId);
    if (member) setActiveUser(member);
  };

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-double border-rule bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-2 px-4 py-2">
        <span className="text-lg font-bold italic tracking-tight">
          Kapitan Kidd
        </span>
        <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted sm:inline">
          Ship&rsquo;s Log
        </span>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-auto">
          {error ? (
            <span className="text-sm text-accent">{error}</span>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Role
                </span>
                <Select
                  value={selectedRole}
                  disabled={loading}
                  onChange={(event) =>
                    handleRoleChange(event.target.value as RoleName)
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Member
                </span>
                <Select
                  value={selectedMemberId}
                  disabled={loading || members.length === 0}
                  onChange={(event) => handleMemberChange(event.target.value)}
                >
                  {members.length === 0 && (
                    <option value="">
                      {loading ? "Loading…" : "No members"}
                    </option>
                  )}
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </label>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
