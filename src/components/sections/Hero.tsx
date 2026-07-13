import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.16, 1, 0.3, 1] as const;

const VALUE_ITEMS = [
  {
    title: "AI-native product architecture",
    body: "Intelligence built into the core of every product — never bolted on as an afterthought.",
  },
  {
    title: "Enterprise platforms across domains",
    body: "Secure, multi-tenant systems engineered for institutions, recruiters, and businesses.",
  },
  {
    title: "A trusted intelligence layer",
    body: "Transparent, reliable AI that people and organizations can genuinely depend on.",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease },
  },
};

export function Hero() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-32 pb-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-mesh-dark blur-2xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column */}
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div variants={item} className="mb-7 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-[12px] font-semibold text-accent-500">
              <BadgeCheck size={14} />
              MSME Certified
            </span>
            <span className="type-eyebrow inline-flex items-center gap-2 rounded-full glass px-3.5 py-2 text-current/70">
              <Zap size={13} className="text-accent-400" fill="currentColor" />
              Build Today · Scale Tomorrow
            </span>
          </motion.div>

          <h1 className="type-hero text-balance">
            <motion.span variants={item} className="block">
              Intelligent Software
            </motion.span>
            <motion.span variants={item} className="block">
              for the{" "}
              <span className="text-gradient">Next Generation</span>
            </motion.span>
          </h1>

          <motion.p
            variants={item}
            className="type-lead mt-7 max-w-xl text-muted"
          >
            NextGen Labs is an MSME-certified AI technology startup building
            intelligent software products, enterprise platforms, and digital
            ecosystems that empower people and organizations through innovation.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" onClick={() => scrollTo("#products")}>
              Explore Products
              <ArrowRight size={17} />
            </Button>
            <Button size="lg" variant="solid" onClick={() => scrollTo("#contact")}>
              Request Demo
            </Button>
            <button
              onClick={() => scrollTo("#technology")}
              className="group inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium text-accent-400 transition-colors hover:text-accent-500"
            >
              View Platform
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </motion.div>
        </motion.div>

        {/* Right column — value proposition card */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-glass-lg sm:p-10"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-gradient opacity-20 blur-3xl" />

            <span className="type-eyebrow text-accent-400">
              Product Value Proposition
            </span>
            <h2 className="type-h3 mt-3">
              "Right intelligence. Right product. Right time."
            </h2>

            <div className="mt-8 flex flex-col gap-6">
              {VALUE_ITEMS.map((v) => (
                <div key={v.title} className="flex gap-3.5">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-accent-400"
                  />
                  <div>
                    <div className="font-display text-[15.5px] font-semibold tracking-[-0.01em]">
                      {v.title}
                    </div>
                    <div className="mt-1 text-[14px] leading-relaxed text-muted">
                      {v.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-current/10 pt-5 text-[13px] text-muted">
              <span className="font-semibold text-accent-400">Built for:</span>{" "}
              students, recruiters, institutions, and enterprises.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
