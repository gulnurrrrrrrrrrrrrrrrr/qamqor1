"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { ActionFeedback, ResultBox } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

export default function AISuitePage() {
  const [cvLoading, setCvLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [cvContent, setCvContent] = useState("");
  const [letterContent, setLetterContent] = useState("");

  async function handleGenerateCv() {
    setCvLoading(true);
    setCvError(null);
    try {
      const res = await api.generateCv();
      setCvContent(res.content);
    } catch (e) {
      setCvError(e instanceof Error ? e.message : "Failed to generate CV");
    } finally {
      setCvLoading(false);
    }
  }

  async function handleGenerateLetter() {
    setLetterLoading(true);
    setLetterError(null);
    try {
      const program = window.prompt("Target program (optional)", "a leading international university program");
      const res = await api.generateMotivationLetter(program || undefined);
      setLetterContent(res.content);
    } catch (e) {
      setLetterError(e instanceof Error ? e.message : "Failed to generate letter");
    } finally {
      setLetterLoading(false);
    }
  }

  return (
    <RoleShell role="volunteer" title="AI Admissions Suite" subtitle="CV · Motivation letters · Portfolio">
      <div className="grid lg:grid-cols-2 gap-6">
        <Can permission="ai.cv">
          <Panel>
            <FileText className="text-accent-light mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Generate AI CV</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">Build admissions-ready CV from verified volunteer history.</p>
            <Button size="sm" onClick={handleGenerateCv} disabled={cvLoading}>
              {cvLoading ? "Generating…" : "Generate CV"}
            </Button>
            <ActionFeedback loading={cvLoading} error={cvError} success={cvContent ? "CV generated successfully" : null} />
            <ResultBox content={cvContent} label="Your CV" />
          </Panel>
        </Can>
        <Can permission="ai.motivation">
          <Panel>
            <Sparkles className="text-gold mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Motivation Letter</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">AI-crafted letters using your verified impact data.</p>
            <Button variant="secondary" size="sm" onClick={handleGenerateLetter} disabled={letterLoading}>
              {letterLoading ? "Generating…" : "Generate Letter"}
            </Button>
            <ActionFeedback loading={letterLoading} error={letterError} success={letterContent ? "Letter generated successfully" : null} />
            <ResultBox content={letterContent} label="Motivation Letter" />
          </Panel>
        </Can>
      </div>
    </RoleShell>
  );
}
