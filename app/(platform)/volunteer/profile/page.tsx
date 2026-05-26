"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; email: string; skills: { name: string; value: number }[] } | null>(null);

  useEffect(() => {
    api.profile().then(setProfile).catch(console.error);
  }, []);

  return (
    <RoleShell role="volunteer" title="Profile" subtitle="Skills · Interests · Achievements">
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel>
          <h3 className="text-sm font-medium text-white mb-4">Personal Info</h3>
          <div className="space-y-3 text-sm">
            <div><p className="text-xs text-ink-500">Name</p><p className="text-ink-100">{profile?.name ?? user?.name}</p></div>
            <div><p className="text-xs text-ink-500">Email</p><p className="text-ink-100">{profile?.email ?? user?.email}</p></div>
          </div>
        </Panel>
        <Panel>
          <h3 className="text-sm font-medium text-white mb-4">Skills & Interests</h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.skills ?? []).map((s) => (
              <span key={s.name} className="rounded-lg bg-white/[0.04] px-3 py-1 text-xs text-ink-200">{s.name} · {s.value}</span>
            ))}
          </div>
        </Panel>
      </div>
    </RoleShell>
  );
}
