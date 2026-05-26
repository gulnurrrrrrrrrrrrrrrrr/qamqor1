"use client";

import { useState } from "react";
import { Copy, Download, FileText, RefreshCw, Sparkles } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { ActionFeedback, ResultBox } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";
import { downloadCvPdf } from "@/lib/utils/pdf";

export default function AISuitePage() {
  const [cvLoading, setCvLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [cvCopied, setCvCopied] = useState(false);
  const [letterCopied, setLetterCopied] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [letterContent, setLetterContent] = useState("");

  async function handleGenerateCv() {
    setCvLoading(true);
    setCvError(null);
    setCvCopied(false);
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
    setLetterCopied(false);
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

  async function handleCopyCv() {
    if (!cvContent) return;
    try {
      await navigator.clipboard.writeText(cvContent);
      setCvCopied(true);
      window.setTimeout(() => setCvCopied(false), 2000);
    } catch {
      setCvError("Could not copy to clipboard");
    }
  }

  async function handleCopyLetter() {
    if (!letterContent) return;
    try {
      await navigator.clipboard.writeText(letterContent);
      setLetterCopied(true);
      window.setTimeout(() => setLetterCopied(false), 2000);
    } catch {
      setLetterError("Could not copy to clipboard");
    }
  }

  function handleDownloadPdf() {
    if (!cvContent) return;
    downloadCvPdf(cvContent);
  }

  return (
    <RoleShell role="volunteer" title="AI Admissions Suite" subtitle="CV · Motivation letters · Portfolio">
      <div className="grid lg:grid-cols-2 gap-6">
        <Can permission="ai.cv">
          <Panel>
            <FileText className="text-accent-light mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Generate AI CV</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">Build admissions-ready CV from verified volunteer history.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleGenerateCv} disabled={cvLoading}>
                {cvLoading ? "Generating…" : cvContent ? "Regenerate" : "Generate CV"}
              </Button>
              {cvContent && (
                <>
                  <Button size="sm" variant="secondary" onClick={handleGenerateCv} disabled={cvLoading} aria-label="Regenerate CV">
                    <RefreshCw size={14} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCopyCv} disabled={cvLoading}>
                    <Copy size={14} />
                    {cvCopied ? "Copied" : "Copy CV"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleDownloadPdf} disabled={cvLoading}>
                    <Download size={14} />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
            <ActionFeedback loading={cvLoading} error={cvError} success={cvContent && !cvLoading ? "CV generated successfully" : null} />
            <ResultBox content={cvContent} label="Your CV" />
          </Panel>
        </Can>
        <Can permission="ai.motivation">
          <Panel>
            <Sparkles className="text-gold mb-3" size={24} />
            <h3 className="text-sm font-medium text-white">Motivation Letter</h3>
            <p className="text-xs text-ink-400 mt-2 mb-4">AI-crafted letters using your verified impact data.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleGenerateLetter} disabled={letterLoading}>
                {letterLoading ? "Generating…" : letterContent ? "Regenerate" : "Generate Letter"}
              </Button>
              {letterContent && (
                <>
                  <Button size="sm" variant="ghost" onClick={handleGenerateLetter} disabled={letterLoading} aria-label="Regenerate letter">
                    <RefreshCw size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopyLetter} disabled={letterLoading}>
                    <Copy size={14} />
                    {letterCopied ? "Copied" : "Copy"}
                  </Button>
                </>
              )}
            </div>
            <ActionFeedback loading={letterLoading} error={letterError} success={letterContent && !letterLoading ? "Letter generated successfully" : null} />
            <ResultBox content={letterContent} label="Motivation Letter" />
          </Panel>
        </Can>
      </div>
    </RoleShell>
  );
}
