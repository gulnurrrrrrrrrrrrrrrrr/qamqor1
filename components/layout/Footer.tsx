import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20 text-xs font-semibold text-accent-light">Q</span>
          <span className="text-sm text-ink-300">Qamqor AI · Social Capital Passport</span>
        </div>
        <div className="flex gap-6 text-sm text-ink-400">
          <Link href="/onboarding" className="hover:text-ink-100">Get Started</Link>
        </div>
      </div>
    </footer>
  );
}
