import { motion } from "framer-motion";
import {
  Brain,
  Building2,
  Cloud,
  ShieldCheck,
  Gauge,
  Wand2,
  ArrowUpRight,
} from "lucide-react";
import { WHY_CARDS } from "@/lib/content";
import { Reveal, staggerContainer, staggerItem } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

const icons = [Brain, Building2, Cloud, ShieldCheck, Gauge, Wand2];

export function WhyUs() {
  return (
    <section className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Why NextGen Labs</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            Engineered like an
            <span className="text-gradient"> enterprise.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            Principles that shape every product we build — from the first line
            of code to global scale.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {WHY_CARDS.map((card, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={card.title}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-2xl glass p-7 transition-all duration-300 hover:border-accent-500/25 hover:shadow-glass"
              >
                {/* top accent line on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-gradient opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15" />

                <div className="mb-5 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-gradient text-white shadow-[0_8px_24px_rgba(27,141,185,0.35)]">
                    <Icon size={20} />
                  </div>
                  <span className="type-eyebrow text-muted/60">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-[18px] font-semibold tracking-[-0.01em]">
                    {card.title}
                  </h3>
                  <ArrowUpRight
                    size={16}
                    className="text-accent-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  {card.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
