"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NAV_BY_ROLE, ROLE_LABELS, ROLE_ACCENT } from "@/lib/auth/navigation";
import type { Role } from "@/lib/auth/types";
import { ROLE_HOME } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface RoleShellProps {
  role: Role;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function RoleShell({ role, children, title, subtitle }: RoleShellProps) {
  const path = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const { user, signOut } = useAuth();
  const nav = NAV_BY_ROLE[role];

  return (
    <div className="min-h-screen bg-ink">
      <div className="lg:flex">
        <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 glass-raised border-r border-white/[0.06] transform transition lg:translate-x-0 lg:static", navOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-full flex-col p-5">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-sm font-semibold text-accent-light">Q</span>
              <span className="text-sm font-semibold text-white">Qamqor</span>
            </Link>
            <div className={cn("rounded-xl border bg-gradient-to-br px-3 py-2 mb-6", ROLE_ACCENT[role])}>
              <p className="text-[10px] uppercase tracking-widest text-ink-400">Workspace</p>
              <p className="text-sm font-medium text-white">{ROLE_LABELS[role]}</p>
              {user && <p className="text-xs text-ink-400 truncate">{user.name}</p>}
            </div>
            <nav className="space-y-0.5 flex-1 overflow-y-auto">
              {nav.map((item) => {
                const home = ROLE_HOME[role];
                const active = path === item.href || (item.href !== home && path.startsWith(item.href + "/"));
                return (
                  <Link key={item.href} href={item.href} onClick={() => setNavOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", active ? "bg-white/[0.08] text-white" : "text-ink-300 hover:bg-white/[0.04] hover:text-white")}>
                    <item.icon size={17} className={active ? "text-accent-light" : "text-ink-500"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={signOut} className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-400 hover:text-white hover:bg-white/[0.04]">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>
        {navOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} />}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 glass border-b border-white/[0.06] px-4 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-ink-200" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">{navOpen ? <X size={20} /> : <Menu size={20} />}</button>
              <div>
                <h1 className="text-lg font-medium text-white">{title}</h1>
                {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
