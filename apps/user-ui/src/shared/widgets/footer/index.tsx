"use client"

import { Instagram, Facebook, Youtube, ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

const COLS = [
  { title: "Customer service", links: ["Help center", "Buyer protection", "Report a listing", "Contact us"] },
  { title: "Shopping", links: ["Super Deals", "Choice items", "Coupons & discounts", "Payment methods"] },
  { title: "Sell on Vendora", links: ["Open a store", "Seller dashboard", "Fees & policies", "Vendor academy"] },
  { title: "Company", links: ["About us", "Careers", "Press", "Sustainability"] },
];

const TRUST = [
  { icon: ShieldCheck, title: "Buyer protection", text: "Refund if item isn't as described" },
  { icon: Truck, title: "Global shipping", text: "Delivery to 200+ countries" },
  { icon: RotateCcw, title: "90-day returns", text: "Easy returns on eligible orders" },
  { icon: Headphones, title: "24/7 support", text: "Real humans, any time zone" },
];

const Footer =()=> {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 size-6 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-bold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[1500px] px-4 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
            <div>
              <p className="text-2xl font-extrabold">
                Vendora<span className="text-accent">.</span>
              </p>
              <p className="mt-3 max-w-xs text-sm text-ink-foreground/60">
                A multi-vendor marketplace connecting 180,000+ sellers with buyers in 200+ countries.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-5 flex items-center gap-2 border-b border-ink-foreground/25 pb-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Email for deal alerts"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink-foreground/40"
                />
                <button aria-label="Subscribe" className="text-accent transition-transform hover:translate-x-1">
                  <ArrowRight className="size-5" />
                </button>
              </form>
              <div className="mt-6 flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social media"
                    className="grid size-9 place-items-center rounded-full border border-ink-foreground/20 hover:bg-ink-foreground/10"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-sm font-bold">{c.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/60">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-ink-foreground">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/50">
            <p>© 2026 Vendora Marketplace. All rights reserved.</p>
            <div className="flex flex-wrap gap-5">
              <a href="#">Terms of use</a>
              <a href="#">Privacy policy</a>
              <a href="#">Cookie preferences</a>
              <a href="#">Intellectual property</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer