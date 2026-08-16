"use client";

import { useSession } from "@/features/auth/session-context";
import { UsersSection } from "@/features/users/components/users-section";
import { VesselsSection } from "@/features/vessels/components/vessels-section";

export default function Home() {
  const { activeUser, loading, error } = useSession();

  if (loading) {
    return <p className="p-4 text-sm italic text-muted">Opening the log…</p>;
  }

  if (error || !activeUser) {
    return (
      <p className="p-4 text-sm text-accent">
        {error ?? "No users available. Run the database seeds."}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        On watch &middot; {activeUser.role}
      </p>
      <h1 className="mt-1 text-3xl font-bold">Welcome, {activeUser.name}</h1>
      <div className="mt-4 border-b border-rule" />

      {activeUser.role === "Admin" && (
        <>
          <VesselsSection />
          <UsersSection />
        </>
      )}
    </div>
  );
}
