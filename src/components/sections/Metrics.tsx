import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { METRICS } from "@/lib/content";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

function Counter({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function Metrics() {
  return (
    <section className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Company Metrics</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            Numbers that
            <span className="text-gradient"> scale with trust.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            Real signals of adoption, reliability, and impact across everything
            we build and operate.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl glass p-8 text-center"
            >
              <div className="font-display text-[clamp(2.4rem,4.5vw,3.25rem)] font-bold tracking-[-0.03em] text-gradient">
                <Counter value={m.value} suffix={m.suffix} decimals={m.decimals} />
              </div>
              <div className="mt-2 text-[14px] font-medium text-muted">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
