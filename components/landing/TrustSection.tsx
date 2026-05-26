import { QrCode, MapPin, ShieldCheck, Award } from "lucide-react";

const features = [
  { icon: QrCode, title: "QR Check-in", desc: "Instant attendance verification at event sites" },
  { icon: MapPin, title: "Geo Verification", desc: "Location-bound proof for offline volunteering" },
  { icon: ShieldCheck, title: "Reputation System", desc: "AI-powered trust scoring across organizations" },
  { icon: Award, title: "Verified Certificates", desc: "Blockchain-ready credentials for portfolios" },
];

export function TrustSection() {
  return (
    <section className="py-24 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-widest text-accent-light mb-3">Anti-Fraud Engine</p>
            <h2 className="text-3xl font-medium text-white sm:text-4xl">Every hour verified.<br />Every credential trusted.</h2>
            <p className="mt-4 text-ink-300 leading-relaxed">Multi-layer validation ensures your volunteering becomes undeniable social capital — recognized by universities and employers worldwide.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className="glass-raised rounded-2xl p-5 animate-in-view" style={{ animationDelay: `${i * 80}ms` }}>
                <f.icon size={20} className="text-accent-light mb-3" aria-hidden />
                <h3 className="text-sm font-medium text-white">{f.title}</h3>
                <p className="mt-1 text-xs text-ink-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
