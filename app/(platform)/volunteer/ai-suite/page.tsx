"use client";

import { FileText, Sparkles } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";

export default function AISuitePage() {
  return (
    <RoleShell role="volunteer" title="AI Admissions Suite" subtitle="CV · Motivation letters · Portfolio">
      <div className="grid lg:grid-cols-2 gap-6">
        <Can permission="ai.cv">
          <Panel>
            <FileText className="text-accent-light mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Generate AI CV</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">Build admissions-ready CV from verified volunteer history.</p>
            <Button size="sm">Generate CV</Button>
          </Panel>
        </Can>
        <Can permission="ai.motivation">
          <Panel>
            <Sparkles className="text-gold mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Motivation Letter</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">AI-crafted letters using your verified impact data.</p>
            <Button variant="secondary" size="sm">Generate Letter</Button>
          </Panel>
        </Can>
      </div>
    </RoleShell>
  );
}
