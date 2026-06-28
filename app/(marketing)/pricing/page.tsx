import Link from "next/link";
import { IconCheck, IconX } from "@tabler/icons-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    cta: "Current plan",
    ctaStyle: "outline" as const,
    featured: false,
    features: [
      { name: "5 uploads / month", included: true },
      { name: "720p export", included: true },
      { name: "Basic AI analysis", included: true },
      { name: "1 connected platform", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Priority processing", included: false },
      { name: "Custom branding", included: false },
      { name: "Team collaboration", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/mo",
    cta: "Upgrade to Pro",
    ctaStyle: "filled" as const,
    featured: true,
    badge: "Most popular",
    features: [
      { name: "50 uploads / month", included: true },
      { name: "1080p export", included: true },
      { name: "Advanced AI analysis", included: true },
      { name: "5 connected platforms", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority processing", included: true },
      { name: "Custom branding", included: false },
      { name: "Team collaboration", included: false },
    ],
  },
  {
    name: "Studio",
    price: "$99",
    cadence: "/mo",
    cta: "Talk to sales",
    ctaStyle: "outline" as const,
    featured: false,
    features: [
      { name: "Unlimited uploads", included: true },
      { name: "4K export", included: true },
      { name: "Advanced AI analysis", included: true },
      { name: "Unlimited platforms", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority processing", included: true },
      { name: "Custom branding", included: true },
      { name: "Team collaboration", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-cinematic">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border-hair">
        <Link href="/" className="text-lg font-semibold text-white tracking-tight">
          truss
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm text-white bg-accent hover:bg-accent/90 px-4 py-2 rounded-full transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center pt-16 pb-12 px-6">
        <h1 className="text-4xl font-bold text-white mb-3">Simple, transparent pricing</h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">
          Start free and scale as you grow. No hidden fees.
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-panel rounded-2xl p-6 flex flex-col ${
              plan.featured
                ? "border-2 border-accent"
                : "border border-border"
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[30px] font-semibold text-white">{plan.price}</span>
              <span className="text-sm text-zinc-500">{plan.cadence}</span>
            </div>

            {/* Features */}
            <div className="flex-1 mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  {feature.included ? (
                    <IconCheck size={16} className="text-success shrink-0" />
                  ) : (
                    <IconX size={16} className="text-zinc-600 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      feature.included ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              {plan.ctaStyle === "filled" ? (
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {plan.cta}
                </Link>
              ) : (
                <Link
                  href={plan.name === "Studio" ? "#" : "/signup"}
                  className="block w-full text-center py-3 border border-border text-zinc-400 hover:text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
