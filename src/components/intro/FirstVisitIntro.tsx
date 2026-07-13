import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Cloud,
  ShieldCheck,
  BarChart3,
  Workflow,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const STORAGE_KEY = "nextgen_intro_seen";
const SCENE_MS = 3000;
const SCENES = 5;
const TOTAL_MS = SCENE_MS * SCENES; // 15s
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic 15-second brand presentation (5 scenes × 3s):
 *  0–3  Logo reveal   · 3–6  Company intro · 6–9  Products
 *  9–12 Innovation    · 12–15 Vision + CTA
 * Persistence controlled by parent <AnimatePresence>; calls onExit on skip,
 * enter, or completion. Honors prefers-reduced-motion.
 */
export function FirstVisitIntro({ onExit }: { onExit: () => void }) {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    // Always play the full 15s sequence; reduced-motion only affects the
    // decorative looping effects (particles/pulses), not scene timing.
    const timers: number[] = [];
    for (let i = 1; i < SCENES; i++) {
      timers.push(window.setTimeout(() => setScene(i), SCENE_MS * i));
    }
    timers.push(window.setTimeout(onExit, TOTAL_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [onExit]);

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(16px)", scale: 1.04 }}
      transition={{ duration: 1, ease }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--bg)]"
      role="dialog"
      aria-label="NextGen Labs introduction"
    >
      <AmbientBackground reduce={!!reduce} />

      {/* persistent controls */}
      <button
        onClick={onExit}
        className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-[13px] text-current/70 transition-colors hover:text-current"
      >
        Skip Intro <X size={14} />
      </button>

      {/* scene stage */}
      <div className="relative z-10 mx-6 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {scene === 0 && <SceneLogo key="s0" />}
          {scene === 1 && <SceneCompany key="s1" />}
          {scene === 2 && <SceneProducts key="s2" />}
          {scene === 3 && <SceneInnovation key="s3" reduce={!!reduce} />}
          {scene === 4 && <SceneVision key="s4" onEnter={onExit} />}
        </AnimatePresence>
      </div>

      {/* always-visible enter + progress */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-6">
        {scene < 4 && (
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full glass-strong px-5 py-2.5 text-[13.5px] font-medium text-current/80 transition-all hover:-translate-y-0.5 hover:text-current"
          >
            Enter Website <ArrowRight size={15} />
          </button>
        )}
        <div className="h-[3px] w-full max-w-xs overflow-hidden rounded-full bg-current/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
            className="h-full rounded-full bg-accent-gradient"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------- shared motion ---------------------------- */

const sceneWrap = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
  exit: { opacity: 0, y: -16, filter: "blur(8px)", transition: { duration: 0.4 } },
};
const rise = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

/* ----------------------------- Scene 0 -------------------------------- */

function SceneLogo() {
  return (
    <motion.div variants={sceneWrap} initial="hidden" animate="visible" exit="exit" className="text-center">
      <motion.div variants={rise} className="relative mx-auto mb-8 inline-block">
        <motion.div initial={{ scale: 0.75 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease }}>
          <Logo className="h-20 sm:h-24" />
        </motion.div>
        {/* light sweep + glass reflection */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 1.6, ease, delay: 0.4 }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </motion.div>
      <motion.h1 variants={rise} className="type-eyebrow text-accent-400">
        NEXTGEN LABS
      </motion.h1>
      <motion.p variants={rise} className="type-h3 mx-auto mt-3 max-w-lg text-balance">
        Building Intelligent Software
        <br />
        <span className="text-gradient">for the Next Generation.</span>
      </motion.p>
    </motion.div>
  );
}

/* ----------------------------- Scene 1 -------------------------------- */

function SceneCompany() {
  const lines = [
    "MSME Certified Startup",
    "AI-Powered Product Company",
    "Enterprise Software Development",
    "Cloud-Native Architecture",
  ];
  return (
    <motion.div variants={sceneWrap} initial="hidden" animate="visible" exit="exit" className="text-center">
      <motion.div variants={rise} className="mb-8 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-[12px] font-semibold text-accent-500">
          <Sparkles size={13} /> Who we are
        </span>
      </motion.div>
      <div className="flex flex-col gap-4">
        {lines.map((l) => (
          <motion.p key={l} variants={rise} className="font-display text-[clamp(1.4rem,3.2vw,2.2rem)] font-semibold tracking-[-0.02em]">
            {l}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

/* ----------------------------- Scene 2 -------------------------------- */

function SceneProducts() {
  const cards = [
    { name: "TalentOS", tag: "AI Career Operating System", rot: -18 },
    { name: "Resume Optimizer", tag: "AI Resume Intelligence Platform", rot: 0 },
    { name: "Enterprise AI Solutions", tag: "Products at scale", rot: 18 },
  ];
  return (
    <motion.div variants={sceneWrap} initial="hidden" animate="visible" exit="exit">
      <motion.p variants={rise} className="type-eyebrow mb-8 text-center text-accent-400">
        Our Products
      </motion.p>
      <div className="flex flex-wrap items-center justify-center gap-5" style={{ perspective: 1000 }}>
        {cards.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, rotateY: c.rot, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.15 }}
            whileHover={{ y: -8, rotateY: -6 }}
            className="relative w-[210px] rounded-2xl glass-strong p-6 shadow-glass-lg"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-gradient opacity-25 blur-2xl" />
            <div className="text-[11px] font-medium tracking-[0.16em] text-muted">0{i + 1}</div>
            <div className="mt-2 font-display text-[18px] font-semibold tracking-[-0.01em]">{c.name}</div>
            <div className="mt-1 text-[13px] text-gradient">{c.tag}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ----------------------------- Scene 3 -------------------------------- */

function SceneInnovation({ reduce }: { reduce: boolean }) {
  const nodes = [
    { label: "AI", icon: Brain, angle: -90 },
    { label: "Cloud", icon: Cloud, angle: -18 },
    { label: "Security", icon: ShieldCheck, angle: 54 },
    { label: "Analytics", icon: BarChart3, angle: 126 },
    { label: "Automation", icon: Workflow, angle: 198 },
  ];
  const R = 120;
  const pos = (a: number) => ({
    x: Math.cos((a * Math.PI) / 180) * R,
    y: Math.sin((a * Math.PI) / 180) * R,
  });

  return (
    <motion.div variants={sceneWrap} initial="hidden" animate="visible" exit="exit" className="text-center">
      <motion.p variants={rise} className="type-eyebrow mb-6 text-accent-400">
        Innovation & Technology
      </motion.p>
      <motion.div variants={rise} className="relative mx-auto h-[300px] w-[300px]">
        <svg viewBox="-160 -160 320 320" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="intro-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#3AA9D3" />
              <stop offset="1" stopColor="#12678C" />
            </radialGradient>
          </defs>
          {nodes.map((n, i) => {
            const p = pos(n.angle);
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={p.x} y2={p.y} stroke="#1B8DB9" strokeOpacity="0.45" strokeWidth="1.5" />
                {!reduce && (
                  <motion.circle
                    r="3"
                    fill="#3AA9D3"
                    animate={{ cx: [0, p.x], cy: [0, p.y], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                  />
                )}
              </g>
            );
          })}
          <motion.circle r="26" fill="url(#intro-core)" animate={reduce ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ transformOrigin: "0 0" }} />
        </svg>
        {nodes.map((n, i) => {
          const p = pos(n.angle);
          return (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease }}
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
              style={{ x: p.x, y: p.y, translateX: "-50%", translateY: "-50%" }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl glass-strong text-accent-400">
                <n.icon size={18} />
              </div>
              <span className="text-[11px] font-medium text-current/70">{n.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------- Scene 4 -------------------------------- */

function SceneVision({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div variants={sceneWrap} initial="hidden" animate="visible" exit="exit" className="text-center">
      <motion.h2 variants={rise} className="type-h2 mx-auto max-w-2xl text-balance">
        Engineering the Future of
        <br />
        <span className="text-gradient">Digital Intelligence.</span>
      </motion.h2>
      <motion.p variants={rise} className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
        Building products for students, professionals, recruiters, and enterprises.
      </motion.p>
      <motion.div variants={rise} className="mt-9 flex justify-center">
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className="group relative inline-flex items-center gap-2 rounded-full bg-accent-gradient px-9 py-4 text-[15px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_10px_44px_rgba(27,141,185,0.5)] transition-shadow hover:shadow-[0_16px_60px_rgba(27,141,185,0.65)]"
        >
          <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative">Enter NextGen Labs</span>
          <ArrowRight size={18} className="relative transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------- Ambient background ------------------------- */

function AmbientBackground({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(130%_95%_at_50%_-10%,#15293b_0%,#0e1a26_32%,#0a0f16_62%,#060a10_100%)]" />
      <div className="grid-lines absolute inset-0 opacity-40" />
      <motion.div
        animate={reduce ? {} : { opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/3 h-[560px] w-[840px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/15 blur-[150px]"
      />
      {!reduce &&
        Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-sky-300/40"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
            animate={{ y: [0, -26, 0], opacity: [0, 0.85, 0] }}
            transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
          />
        ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
    </div>
  );
}

/** First-visit gate. */
export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
