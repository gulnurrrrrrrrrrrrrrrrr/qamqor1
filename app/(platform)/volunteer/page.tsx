"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Award, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { api } from "@/lib/api/client";

const MetricRing = dynamic(() => import("@/components/dashboard/MetricRing").then((m) => m.MetricRing), { loading: () => <div className="h-[120px] w-[120px] rounded-full bg-white/[0.04] animate-pulse" /> });
const SkillRadar = dynamic(() => import("@/components/dashboard/SkillRadar").then((m) => m.SkillRadar), { loading: () => <div className="h-[220px] animate-pulse bg-white/[0.04] rounded-xl" /> });

type Dashboard = Awaited<ReturnType<typeof api.volunteerDashboard>>;

export default function VolunteerHome() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.volunteerDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <RoleShell role="volunteer" title="Social Capital Passport" subtitle="Loading…"><div className="h-64 animate-pulse bg-white/[0.04] rounded-2xl" /></RoleShell>;

  const { stats, timeline, skills, certificates } = data;

  return (
    <RoleShell role="volunteer" title="Social Capital Passport" subtitle={`${user?.name ?? "Volunteer"} · Verified`}>
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <Panel className="lg:col-span-1 flex justify-center">
          <Can permission="trust.view"><MetricRing value={stats.trustScore} label="Trust Score" sublabel="Top 12%" color="#818cf8" /></Can>
        </Panel>
        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          <Stat label="Leadership Index" value={stats.leadershipIndex} />
          <Can permission="hours.view"><Stat label="Impact Hours" value={`${stats.impactHours}h`} /></Can>
          <Stat label="Admissions Readiness" value={`${stats.admissionsReadiness}%`} accent />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Panel className="lg:col-span-2">
          <h2 className="text-sm font-medium text-white mb-4">Verified Timeline</h2>
          {timeline.map((t) => (
            <div key={t.id} className="flex gap-4 mb-4">
              <div className="h-3 w-3 mt-1.5 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
              <div className="flex-1 flex justify-between">
                <div><p className="text-sm text-white">{t.title}</p><p className="text-xs text-ink-400">{t.org} · {t.date}</p></div>
                <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} aria-hidden />{t.hours}h</span>
              </div>
            </div>
          ))}
        </Panel>
        <Can permission="skills.manage"><Panel><h2 className="text-sm font-medium text-white mb-4">Skill Radar</h2><SkillRadar skills={skills} /></Panel></Can>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Can permission="certificates.view">
          <Panel>
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Award size={16} className="text-gold" aria-hidden />Certificates</h2>
            {certificates.map((c) => (
              <div key={c.id} className="flex justify-between rounded-xl bg-white/[0.03] p-4 mb-2">
                <div><p className="text-sm text-white">{c.name}</p><p className="text-xs text-ink-400">{c.issuer}</p></div>
                <span className="text-[10px] text-emerald-400 uppercase">Verified</span>
              </div>
            ))}
            <Link href="/volunteer/certificates" className="text-xs text-accent-light mt-2 inline-block">View all →</Link>
          </Panel>
        </Can>
        <Can permission="ai.admissions">
          <Panel>
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Sparkles size={16} className="text-accent-light" aria-hidden />AI Recommendations</h2>
            <p className="text-xs text-ink-300 mb-4">Apply to Youth Policy Forum — 94% skill match</p>
            <Button href="/volunteer/ai-suite" size="sm">Open AI Admissions Suite</Button>
          </Panel>
        </Can>
      </div>
    </RoleShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <Panel>
      <p className="text-xs text-ink-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "accent-gradient" : "text-white"}`}>{value}</p>
    </Panel>
  );
}
