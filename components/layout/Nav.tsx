"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROLE_HOME, type Role } from "@/lib/auth/types";

const ROLE_COOKIE = "qamqor_role";
import { cn } from "@/lib/utils";

const VALID: Role[] = ["volunteer", "organization", "admin"];

function readRoleFromCookie(): Role | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${ROLE_COOKIE}=([^;]+)`));
  const v = match?.[1] as Role | undefined;
  return v && VALID.includes(v) ? v : null;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    setRole(readRoleFromCookie());
  }, []);

  const dashboardHref = role ? ROLE_HOME[role] : "/onboarding";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-sm font-semibold text-accent-light">Q</span>
          <span className="text-sm font-semibold tracking-tight text-white">Qamqor</span>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" href={dashboardHref} size="sm">{role ? "Dashboard" : "Sign in"}</Button>
          <Button href={role ? "/onboarding?switch=1" : "/onboarding"} size="sm">{role ? "Switch role" : "Get started"}</Button>
        </div>
        <button className="md:hidden text-ink-100" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      <div className={cn("glass-raised mx-4 overflow-hidden rounded-2xl md:hidden", open ? "max-h-48 opacity-100" : "max-h-0 opacity-0 pointer-events-none")}>
        <div className="flex flex-col gap-1 p-4">
          <Button href={dashboardHref} className="w-full">{role ? "Dashboard" : "Sign in"}</Button>
          <Button variant="secondary" href="/onboarding" className="w-full">Get started</Button>
        </div>
      </div>
    </header>
  );
}
