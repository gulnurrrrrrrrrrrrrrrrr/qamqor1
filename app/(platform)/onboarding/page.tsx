"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, Building2, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const roles: { id: Role; title: string; desc: string; icon: typeof Heart }[] = [
  { id: "volunteer", title: "Volunteer", desc: "Discover opportunities and build verified social capital.", icon: Heart },
  { id: "organization", title: "Organization", desc: "Create events and manage volunteers.", icon: Building2 },
  { id: "admin", title: "Administrator", desc: "Moderate platform and manage users.", icon: Shield },
];

function OnboardingContent() {
  const { register, login, signOut } = useAuth();
  const searchParams = useSearchParams();
  const switching = searchParams.get("switch") === "1";
  const [mode, setMode] = useState<"register" | "login">("register");
  const [role, setRole] = useState<Role>("volunteer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Name is required");
        await register({ email, password, name, role });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-accent/20 text-accent-light font-semibold mb-4">Q</span>
          <h1 className="text-2xl font-medium text-white">{switching ? "Switch account" : "Get started"}</h1>
          {switching && (
            <button type="button" onClick={() => signOut()} className="text-xs text-accent-light mt-2 hover:underline">
              Sign out current session
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {(["register", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn("flex-1 rounded-lg py-2 text-sm capitalize", mode === m ? "bg-accent/20 text-accent-light" : "text-ink-400 hover:bg-white/[0.04]")}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn("rounded-xl border p-3 text-left text-xs transition", role === r.id ? "border-accent/40 bg-accent/10 text-white" : "border-white/[0.06] text-ink-400")}
              >
                <r.icon size={16} className="mb-1" />
                {r.title}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-raised rounded-2xl p-6 space-y-4">
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-white"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            minLength={6}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-white"
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-[11px] text-ink-500">Demo: aida@qamqor.kz / org@greenfuture.kz / admin@qamqor.kz · password123</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <OnboardingContent />
    </Suspense>
  );
}
