import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { TRUST_BADGES } from "@/lib/content";
import { staggerContainer, staggerItem } from "@/components/shared/Reveal";

export function TrustBar() {
  return (
    <section className="relative border-y border-current/5 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="type-eyebrow mb-8 text-center text-muted">
          Recognition & Standards
        </p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {TRUST_BADGES.map((badge) => (
            <motion.div
              key={badge}
              variants={staggerItem}
              className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium text-current/80 transition-transform hover:-translate-y-0.5"
            >
              <BadgeCheck size={15} className="text-accent-500" />
              {badge}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
