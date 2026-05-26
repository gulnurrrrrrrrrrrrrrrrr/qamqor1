"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";
import { parseQrToken } from "@/lib/attendance/qr-payload";

type Props = {
  active: boolean;
  onScan: (token: string) => void;
  onClose?: () => void;
};

export function QrScanner({ active, onScan, onClose }: Props) {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [showManual, setShowManual] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      /* already stopped */
    }
  }, []);

  const handleDecoded = useCallback(
    async (raw: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      try {
        const token = parseQrToken(raw);
        await stopScanner();
        onScan(token);
      } catch (e) {
        handledRef.current = false;
        setCameraError(e instanceof Error ? e.message : "Invalid QR code");
      }
    },
    [onScan, stopScanner]
  );

  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      setCameraError(null);
      void stopScanner();
      return;
    }

    handledRef.current = false;
    setCameraError(null);
    let cancelled = false;

    async function start() {
      await stopScanner();
      if (cancelled) return;

      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
          (text) => void handleDecoded(text),
          () => {}
        );
      } catch {
        if (!cancelled) {
          setCameraError("Camera unavailable. Use manual entry below.");
          setShowManual(true);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [active, regionId, handleDecoded, stopScanner]);

  function submitManual() {
    const trimmed = manualToken.trim();
    if (!trimmed) {
      setCameraError("Enter a token");
      return;
    }
    setCameraError(null);
    try {
      onScan(parseQrToken(trimmed));
    } catch (e) {
      setCameraError(e instanceof Error ? e.message : "Invalid token");
    }
  }

  if (!active) return null;

  return (
    <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div id={regionId} className="w-full min-h-[240px] bg-black/40 [&_video]:rounded-none" />
      {cameraError && <p className="text-xs text-amber-400 px-4 py-2">{cameraError}</p>}
      <div className="p-4 border-t border-white/[0.06] space-y-3">
        <button
          type="button"
          className="text-xs text-ink-400 hover:text-white transition-colors"
          onClick={() => setShowManual((v) => !v)}
        >
          {showManual ? "Hide manual entry" : "Camera not working? Enter token manually"}
        </button>
        {showManual && (
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste QR token"
              className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-ink-500 focus:outline-none focus:border-accent-light/40"
              autoComplete="off"
            />
            <Button type="button" size="sm" variant="secondary" onClick={submitManual}>
              Submit
            </Button>
          </div>
        )}
        {onClose && (
          <Button type="button" size="sm" variant="ghost" className="w-full" onClick={onClose}>
            Close scanner
          </Button>
        )}
      </div>
    </div>
  );
}
