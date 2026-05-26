"use client";

import dynamic from "next/dynamic";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";

const OpportunitiesView = dynamic(
  () => import("@/components/volunteer/OpportunitiesView").then((m) => m.OpportunitiesView),
  {
    loading: () => <div className="h-96 rounded-2xl bg-white/[0.04] animate-pulse" />,
  }
);

export default function OpportunitiesPage() {
  return (
    <RoleShell role="volunteer" title="Opportunities" subtitle="Browse · Search · Filter · Apply">
      <Can permission="events.browse">
        <OpportunitiesView />
      </Can>
    </RoleShell>
  );
}
