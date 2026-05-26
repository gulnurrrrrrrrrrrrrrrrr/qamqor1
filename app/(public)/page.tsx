import { Hero } from "@/components/landing/Hero";
import { EventPreview } from "@/components/landing/EventPreview";
import { TrustSection } from "@/components/landing/TrustSection";
import { CTASection } from "@/components/landing/CTASection";
import { listEvents } from "@/lib/services/events";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = (await listEvents({ featured: true })).slice(0, 2);
  return (
    <main>
      <Hero />
      <EventPreview events={featured} />
      <TrustSection />
      <CTASection />
    </main>
  );
}
