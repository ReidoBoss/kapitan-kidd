"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useSession } from "@/features/auth/session-context";
import { UsersSection } from "@/features/users/components/users-section";
import { AssignmentsSection } from "@/features/vessel-crews/components/assignments-section";
import { VesselsSection } from "@/features/vessels/components/vessels-section";
import { VesselsProvider } from "@/features/vessels/vessels-context";
import { CaptainWorkOrdersSection } from "@/features/work-orders/components/captain-work-orders-section";
import { CrewWorkOrdersSection } from "@/features/work-orders/components/crew-work-orders-section";

const ADMIN_TABS = [
  "Vessel Registry",
  "Personnel Register",
  "Muster Roll",
] as const;

type AdminTab = (typeof ADMIN_TABS)[number];

export default function Home() {
  const { activeUser, loading, error } = useSession();
  const [adminTab, setAdminTab] = useState<AdminTab>("Vessel Registry");

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

      {activeUser.role === "Captain" && <CaptainWorkOrdersSection />}

      {activeUser.role === "Crew" && <CrewWorkOrdersSection />}

      {activeUser.role === "Admin" && (
        <VesselsProvider>
          <div className="mt-8">
            <Tabs tabs={ADMIN_TABS} active={adminTab} onChange={setAdminTab} />
            {adminTab === "Vessel Registry" && <VesselsSection />}
            {adminTab === "Personnel Register" && <UsersSection />}
            {adminTab === "Muster Roll" && <AssignmentsSection />}
          </div>
        </VesselsProvider>
      )}
    </div>
  );
}
