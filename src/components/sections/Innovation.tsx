import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Bot,
  Workflow,
  Compass,
  Building,
  TrendingUp,
  Boxes,
  ArrowUpRight,
} from "lucide-react";
import { INNOVATION_CARDS } from "@/lib/content";
import { SectionLabel } from "@/components/shared/SectionLabel";

const icons = [Bot, Workflow, Compass, Building, TrendingUp, Boxes];

export function Innovation() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="innovation" ref={targetRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-6xl px-6">
          <SectionLabel>Innovation Lab</SectionLabel>
          <h2 className="type-h2 mt-6 max-w-2xl text-balance">
            The future we're
            <span className="text-gradient"> already building.</span>
          </h2>
          <p className="type-lead mt-6 max-w-xl text-muted">
            Research directions and product bets shaping the next decade of
            intelligent software.
          </p>
        </div>

        <motion.div
          style={{ x }}
          className="flex gap-6 pl-6 sm:pl-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {INNOVATION_CARDS.map((card, i) => {
            const Icon = icons[i];
            return (
              <div
                key={card.title}
                className="group relative flex h-[300px] w-[270px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl glass-strong p-7 shadow-glass transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glass-lg sm:w-[300px]"
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-gradient opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />

                <div className="relative flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-gradient text-white shadow-[0_8px_24px_rgba(27,141,185,0.35)] transition-transform duration-500 group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-current/10 px-2.5 py-1 text-[11px] font-medium text-current/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                    {card.status}
                  </span>
                </div>

                <div className="relative">
                  <span className="type-eyebrow text-accent-400">
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 flex items-center gap-1.5 font-display text-xl font-semibold tracking-[-0.02em]">
                    {card.title}
                    <ArrowUpRight
                      size={18}
                      className="text-accent-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">
                    {card.body}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* scroll progress */}
        <div className="mx-auto mt-10 flex w-full max-w-6xl items-center gap-4 px-6">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-current/10">
            <motion.div
              style={{ width: progress }}
              className="h-full rounded-full bg-accent-gradient"
            />
          </div>
          <span className="type-eyebrow shrink-0 text-muted">
            Scroll to explore
          </span>
        </div>
      </div>
    </section>
  );
}
