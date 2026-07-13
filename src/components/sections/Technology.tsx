import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Server,
  Cpu,
  Cloud,
  Lock,
  BarChart3,
} from "lucide-react";
import { TECH_LAYERS } from "@/lib/content";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { cn } from "@/lib/utils";

const icons = [Layout, Server, Cpu, Cloud, Lock, BarChart3];

const ease = [0.16, 1, 0.3, 1] as const;

export function Technology() {
  const [active, setActive] = useState(2);
  const ActiveIcon = icons[active];
  const layer = TECH_LAYERS[active];

  return (
    <section id="technology" className="section-pad relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Technology Ecosystem</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            One architecture,
            <span className="text-gradient"> fully integrated.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            A layered, real-time system where data flows seamlessly from
            interface to intelligence and back.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* layer stack */}
          <div className="flex flex-col gap-2.5">
            {TECH_LAYERS.map((l, i) => {
              const Icon = icons[i];
              const isActive = active === i;
              return (
                <motion.button
                  key={l.name}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={cn(
                    "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                    isActive
                      ? "glass-strong border-accent-500/30 shadow-glass"
                      : "border-current/5 hover:border-current/15"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tech-active"
                      className="absolute inset-0 -z-10 bg-accent-500/[0.06]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-accent-gradient text-white shadow-glow"
                        : "glass text-current/70 group-hover:text-current"
                    )}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="type-eyebrow text-muted/60">
                        L{i + 1}
                      </span>
                      <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">
                        {l.name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-muted">
                      {l.detail}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full transition-all duration-300",
                      isActive
                        ? "bg-accent-500 shadow-glow"
                        : "bg-current/15 group-hover:bg-current/30"
                    )}
                  />
                </motion.button>
              );
            })}
          </div>

          {/* dynamic visual + detail */}
          <Reveal delay={0.15} className="h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 sm:p-8">
              <div className="grid-lines absolute inset-0 opacity-50" />

              {/* animated architecture graph */}
              <div className="relative mx-auto">
                <svg viewBox="-160 -140 320 280" className="h-[280px] w-full">
                  <defs>
                    <radialGradient id="tech-core" cx="50%" cy="50%" r="50%">
                      <stop offset="0" stopColor="#3AA9D3" />
                      <stop offset="1" stopColor="#12678C" />
                    </radialGradient>
                  </defs>

                  {TECH_LAYERS.map((_, i) => {
                    const angle =
                      (i / TECH_LAYERS.length) * Math.PI * 2 - Math.PI / 2;
                    const r = 118;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    const isActive = active === i;
                    return (
                      <g key={i}>
                        <line
                          x1="0"
                          y1="0"
                          x2={x}
                          y2={y}
                          stroke={isActive ? "#1B8DB9" : "currentColor"}
                          strokeOpacity={isActive ? 0.85 : 0.12}
                          strokeWidth={isActive ? 2 : 1}
                        />
                        {/* flowing data pulse toward the core */}
                        <motion.circle
                          r={isActive ? 3.5 : 2}
                          fill={isActive ? "#3AA9D3" : "currentColor"}
                          fillOpacity={isActive ? 1 : 0.3}
                          animate={{
                            cx: [x, 0],
                            cy: [y, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.35,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.circle
                          cx={x}
                          cy={y}
                          r={isActive ? 13 : 8}
                          fill={isActive ? "url(#tech-core)" : "currentColor"}
                          fillOpacity={isActive ? 1 : 0.14}
                          animate={isActive ? { scale: [1, 1.14, 1] } : {}}
                          transition={{ duration: 1.8, repeat: Infinity }}
                          style={{ transformOrigin: `${x}px ${y}px` }}
                        />
                      </g>
                    );
                  })}

                  <motion.circle
                    r="30"
                    fill="url(#tech-core)"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ transformOrigin: "0px 0px" }}
                  />
                  <circle
                    r="30"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* detail card that reacts to the active layer */}
              <div className="relative mt-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease }}
                    className="rounded-2xl glass-strong p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent-gradient text-white">
                        <ActiveIcon size={18} />
                      </div>
                      <div>
                        <div className="type-eyebrow text-accent-400">
                          Layer {active + 1} / {TECH_LAYERS.length}
                        </div>
                        <div className="font-display text-[17px] font-semibold tracking-[-0.01em]">
                          {layer.name}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-[14px] leading-relaxed text-muted">
                      {layer.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {layer.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-current/10 px-2.5 py-1 font-mono text-[11px] text-current/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
