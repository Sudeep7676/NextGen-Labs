import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/store/theme";
import { ContactCenter } from "@/components/admin/ContactCenter";
import { FirstVisitIntro, markIntroSeen } from "@/components/intro/FirstVisitIntro";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Products } from "@/components/sections/Products";
import { WhyUs } from "@/components/sections/WhyUs";
import { Technology } from "@/components/sections/Technology";
import { Innovation } from "@/components/sections/Innovation";
import { Metrics } from "@/components/sections/Metrics";
import { MissionVision } from "@/components/sections/MissionVision";
import { Contact } from "@/components/sections/Contact";

export default function App() {
  const theme = useTheme((s) => s.theme);
  const [route, setRoute] = useState(() => window.location.hash);
  // Show the cinematic intro on every visit (never on the admin route).
  const [showIntro, setShowIntro] = useState(
    () => window.location.hash !== "#admin"
  );
  const endIntro = () => {
    markIntroSeen();
    setShowIntro(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "#admin") {
    return <ContactCenter />;
  }

  return (
    <>
      <AnimatePresence>
        {showIntro && <FirstVisitIntro onExit={endIntro} />}
      </AnimatePresence>
      <motion.div
        initial={showIntro ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-screen overflow-x-clip"
      >
      {/* fixed ambient background layers — deep emerald-to-black gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* dark-mode gradient base */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(130%_95%_at_50%_-15%,#15293b_0%,#0e1a26_30%,#0a0f16_60%,#060a10_100%)]" />
        {/* light-mode gradient base */}
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(130%_95%_at_50%_-10%,#eef4f9_0%,#ffffff_62%)]" />
        {/* soft blue glow behind hero */}
        <div className="absolute -top-40 left-1/2 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[150px] dark:bg-sky-400/[0.10]" />
        {/* subtle grid */}
        <div className="grid-lines absolute inset-0 opacity-60" />
        {/* bottom vignette for depth */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60" />
        {/* fine noise */}
        <div className="noise absolute inset-0 opacity-[0.015] mix-blend-overlay" />
      </div>

      <Header />

      <main>
        <Hero />
        <TrustBar />
        <Products />
        <WhyUs />
        <Technology />
        <Innovation />
        <Metrics />
        <MissionVision />
        <Contact />
      </main>

      <Footer />
    </motion.div>
    </>
  );
}
