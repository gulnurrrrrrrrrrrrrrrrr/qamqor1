import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 h-80 w-80 rounded-full bg-gold/5 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-ink-200">
            <Sparkles size={12} className="text-gold" aria-hidden />
            Verified social capital for global opportunities
          </div>
          <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-gradient sm:text-5xl md:text-6xl lg:text-7xl">
            Turn Your Volunteering Into a Global Opportunity
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-300 leading-relaxed">
            Discover verified volunteer opportunities and transform real experience into admissions and career advantages.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/onboarding" size="lg">Find Opportunities <ArrowRight size={16} aria-hidden /></Button>
            <Button variant="secondary" href="/onboarding" size="lg">Create Event</Button>
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:absolute lg:right-8 lg:top-1/2 lg:-translate-y-1/2 lg:w-[420px] animate-fade-up-delay">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="glass-raised rounded-2xl p-5 glow-ring">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-ink-400">Social Capital Passport</span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">Verified</span>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/5 flex items-center justify-center text-lg font-semibold text-white">AK</div>
        <div>
          <p className="font-medium text-white">Aida Karimova</p>
          <p className="text-xs text-ink-400">Trust Score · 87</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ l: "Impact", v: "156h" }, { l: "Leadership", v: "72" }, { l: "Ready", v: "78%" }].map((m) => (
          <div key={m.l} className="rounded-xl bg-white/[0.03] p-3 text-center">
            <p className="text-lg font-semibold text-white">{m.v}</p>
            <p className="text-[10px] text-ink-400 uppercase tracking-wider">{m.l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">AI Profile Preview</p>
        <p className="text-xs text-ink-200 leading-relaxed">Demonstrated leadership in climate action and STEM education with 156 verified impact hours across 3 organizations.</p>
      </div>
    </div>
  );
}
