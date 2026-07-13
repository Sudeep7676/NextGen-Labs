import { motion } from "framer-motion";
import { Target, Telescope, Check, Sparkles } from "lucide-react";
import {
  CORE_VALUES,
  MISSION_POINTS,
  VISION_POINTS,
} from "@/lib/content";
import { Reveal, staggerContainer, staggerItem } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

const pillars = [
  {
    icon: Target,
    label: "Mission",
    statement:
      "To build intelligent software products that simplify complex workflows and empower people through technology.",
    points: MISSION_POINTS,
  },
  {
    icon: Telescope,
    label: "Vision",
    statement:
      "To become a globally recognized technology company creating the next generation of AI-powered digital platforms.",
    points: VISION_POINTS,
  },
];

export function MissionVision() {
  return (
    <section id="about" className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent-gradient opacity-[0.06] blur-3xl" />

      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Mission & Vision</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            Built with
            <span className="text-gradient"> purpose.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            A clear reason to exist, and a horizon worth building toward — the
            principles behind every product decision we make.
          </p>
        </Reveal>

        {/* Mission / Vision pillars */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.1}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass-strong p-8 shadow-glass sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-accent-gradient opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent-gradient text-white shadow-glow">
                    <p.icon size={24} />
                  </div>
                  <div className="type-eyebrow text-accent-400">{p.label}</div>
                </div>

                <p className="type-h3 mt-6 text-balance">{p.statement}</p>

                <div className="mt-7 flex flex-col gap-3 border-t border-current/10 pt-6">
                  {p.points.map((pt) => (
                    <div key={pt} className="flex items-start gap-3 text-[14.5px] text-current/80">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500/12 text-accent-500">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Core values */}
        <div className="mt-16">
          <Reveal className="mb-8 flex items-center justify-center gap-2 text-center">
            <Sparkles size={15} className="text-accent-400" />
            <span className="type-eyebrow text-muted">Core Values</span>
          </Reveal>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CORE_VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="rounded-2xl glass p-6 transition-shadow hover:shadow-glass"
              >
                <div className="type-eyebrow text-accent-400">0{i + 1}</div>
                <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em]">
                  {v.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
