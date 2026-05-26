"use client";

import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildCheckInQrValue } from "@/lib/attendance/qr-payload";

type Props = {
  eventTitle: string;
  qrToken: string;
  checkInUrl: string;
};

export function QrCodeDisplay({ eventTitle, qrToken, checkInUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const qrValue = useMemo(() => buildCheckInQrValue(checkInUrl), [checkInUrl]);

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(qrToken);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }

  return (
    <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">QR Code</p>
      <p className="text-xs text-ink-300 mb-3">{eventTitle}</p>
      <div className="flex justify-center">
        <div className="rounded-lg bg-white p-3 shadow-lg">
          <QRCode value={qrValue} size={168} level="M" />
        </div>
      </div>
      <p className="text-[10px] text-ink-500 mt-3 mb-1 text-center">Scan with the volunteer check-in app</p>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
        <code className="text-[11px] text-ink-200 truncate flex-1 font-mono">{qrToken}</code>
        <Button type="button" size="sm" variant="ghost" className="shrink-0" onClick={copyToken}>
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {copied && <p className="text-[10px] text-emerald-400 mt-1 text-center">Token copied</p>}
    </div>
  );
}
