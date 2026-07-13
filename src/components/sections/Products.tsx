import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/content";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ProductCard({ product, i }: { product: Product; i: number }) {
  return (
    <Reveal delay={i * 0.1} className="h-full">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass-strong p-8 shadow-glass transition-shadow hover:shadow-glass-lg sm:p-9"
      >
        {/* accent glow */}
        <div
          className={cn(
            "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30",
            product.accent
          )}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="type-eyebrow text-muted">
                Product {product.index}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-medium text-accent-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                {product.status}
              </span>
            </div>
            <h3 className="type-h3">{product.name}</h3>
            <p className="mt-1.5 text-[15px] font-medium text-gradient">
              {product.tagline}
            </p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass transition-all duration-300 group-hover:bg-accent-gradient group-hover:text-white">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <p className="relative mt-5 text-[15px] leading-relaxed text-muted">
          {product.description}
        </p>

        {/* tag chips */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {product.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-current/10 px-3 py-1 text-[12px] font-medium text-current/70"
            >
              {t}
            </span>
          ))}
        </div>

        {/* stats strip */}
        <div className="relative mt-6 grid grid-cols-3 gap-3 rounded-2xl glass p-4">
          {product.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-[17px] font-bold tracking-tight text-gradient">
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-current/10 pt-6 sm:grid-cols-2">
          {product.features.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-[13.5px] text-current/80">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500/12 text-accent-500">
                <Check size={12} strokeWidth={3} />
              </span>
              {f}
            </div>
          ))}
        </div>

        <div className="relative mt-7 flex items-center gap-3 pt-1">
          <Button
            size="sm"
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore {product.name}
            <ArrowUpRight size={15} />
          </Button>
          <button
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[13.5px] font-medium text-muted transition-colors hover:text-current"
          >
            Request demo
          </button>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function Products() {
  return (
    <section id="products" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Our Products</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            Intelligent products,
            <br />
            <span className="text-gradient">built end to end.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            We don't ship services or prototypes. We build and own complete
            software products designed for scale.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
