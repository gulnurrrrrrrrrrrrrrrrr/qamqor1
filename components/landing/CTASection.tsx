import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-raised px-8 py-16 text-center sm:px-16">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-gold/5" />
          <div className="relative">
            <h2 className="text-3xl font-medium text-white sm:text-4xl">Start building your passport today</h2>
            <p className="mx-auto mt-4 max-w-md text-ink-300">Join thousands of volunteers turning real impact into admissions-ready portfolios.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/onboarding" size="lg">Find Opportunities</Button>
              <Button variant="secondary" href="/onboarding" size="lg">Create Event</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
