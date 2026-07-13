import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { INQUIRY_TYPES, submitContact } from "@/lib/api";
import { useSubmissions } from "@/store/submissions";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Turnstile } from "@/components/shared/Turnstile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT_CARDS = [
  {
    icon: Phone,
    eyebrow: "Call or WhatsApp",
    value: "+91 76761 02096",
    sub: "Mon–Sat, 9:00 AM – 7:00 PM IST",
    href: "tel:+917676102096",
    secondary: { label: "WhatsApp", href: "https://wa.me/917676102096" },
  },
  {
    icon: Mail,
    eyebrow: "Email Directly",
    value: "nextgenlabs.edu@gmail.com",
    sub: "Usually replies within 24–48 hours",
    href: "mailto:nextgenlabs.edu@gmail.com",
  },
  {
    icon: MapPin,
    eyebrow: "Headquarters",
    value: "Talikote, Vijayapura",
    sub: "Karnataka, India",
    href: "https://maps.google.com/?q=Talikote,Vijayapura,Karnataka",
  },
];

type Status = "idle" | "sending" | "success" | "error";

const initialForm = {
  fullName: "",
  email: "",
  companyName: "",
  phoneNumber: "",
  message: "",
};

export function Contact() {
  const [inquiryType, setInquiryType] = useState<string>(INQUIRY_TYPES[0].value);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState(initialForm);
  const [turnstileToken, setTurnstileToken] = useState("");
  const addSubmission = useSubmissions((s) => s.add);

  const activeLabel =
    INQUIRY_TYPES.find((t) => t.value === inquiryType)?.label ?? "inquiry";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");

    try {
      await submitContact({
        fullName: form.fullName,
        email: form.email,
        companyName: form.companyName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        inquiryType,
        message: form.message,
        turnstileToken: turnstileToken || undefined,
      });
      addSubmission({
        name: form.fullName,
        email: form.email,
        interest: activeLabel,
        message: form.message,
        delivered: true,
      });
      setStatus("success");
      setForm(initialForm);
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 7000);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-current/10 bg-transparent px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20";

  return (
    <section id="contact" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Contact</SectionLabel>
          <h2 className="type-h2 mt-6 text-balance">
            Let's build the
            <span className="text-gradient"> future together.</span>
          </h2>
          <p className="type-lead mt-6 text-muted">
            Partner with us, explore our products, or join the team building the
            next generation of intelligent software.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left — contact channels */}
          <Reveal className="flex flex-col gap-4">
            {CONTACT_CARDS.map((c) => (
              <a
                key={c.eyebrow}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-start gap-4 rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glass"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-500/12 text-accent-500 transition-colors group-hover:bg-accent-gradient group-hover:text-white">
                  <c.icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="type-eyebrow text-muted">{c.eyebrow}</div>
                  <div className="mt-1.5 truncate font-display text-[16px] font-semibold tracking-[-0.01em]">
                    {c.value}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">{c.sub}</div>
                  {c.secondary && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-400">
                      <MessageCircle size={13} /> {c.secondary.label}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </Reveal>

          {/* Right — form */}
          <Reveal delay={0.15}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl glass-strong p-7 shadow-glass sm:p-9"
            >
              <h3 className="type-h3">Tell us what you're building</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                Share your objectives and we'll connect you with the right team
                and resources.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <input
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Work email" required>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@company.com"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company name" optional>
                    <input
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Company or organization"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone number" optional>
                    <input
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="+91 ..."
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-current/70">
                    Inquiry type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INQUIRY_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInquiryType(opt.value)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300",
                          inquiryType === opt.value
                            ? "bg-accent-gradient text-white shadow-[0_8px_24px_rgba(27,141,185,0.35)]"
                            : "glass text-current/70 hover:text-current"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Message" required>
                  <textarea
                    required
                    rows={4}
                    minLength={10}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={`Tell us about your ${activeLabel.toLowerCase()}...`}
                    className={cn(inputCls, "resize-none")}
                  />
                </Field>

                <Turnstile onToken={setTurnstileToken} />

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "sending"}
                  className="mt-1 w-full"
                >
                  {status === "sending" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={17} className="animate-spin" /> Sending…
                    </span>
                  ) : status === "success" ? (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={17} /> Message sent
                    </motion.span>
                  ) : (
                    <>
                      Send message <ArrowRight size={17} />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-accent-500/10 px-4 py-3 text-[13.5px] text-accent-500"
                    >
                      <Check size={15} /> Thanks — your inquiry was received.
                      We'll reply within 24–48 hours.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-[13.5px] text-red-500"
                    >
                      <AlertCircle size={15} /> {error || "Couldn't send right now."}{" "}
                      You can also email nextgenlabs.edu@gmail.com.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-current/70">
        {label}
        {required && <span className="text-accent-500"> *</span>}
        {optional && <span className="text-muted"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}
