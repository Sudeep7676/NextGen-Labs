import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Products",
    links: [
      { label: "TalentOS", href: "#products" },
      { label: "Resume Optimizer", href: "#products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Innovation", href: "#innovation" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-current/5 pt-16 pb-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo className="h-10" />
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-muted">
              Building intelligent software products for the next generation of
              people and organizations.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-[14px] text-muted">
              <a
                href="tel:+917676102096"
                className="inline-flex items-center gap-2 transition-colors hover:text-current"
              >
                <Phone size={14} className="text-accent-500" /> +91 76761 02096
              </a>
              <a
                href="mailto:nextgenlabs.edu@gmail.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-current"
              >
                <Mail size={14} className="text-accent-500" /> nextgenlabs.edu@gmail.com
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-accent-500" /> Talikote, Vijayapura, Karnataka
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="type-eyebrow text-current/60">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14.5px] text-muted transition-colors hover:text-current"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-current/5 pt-8 text-[13.5px] text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} NextGen Labs. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-gradient" />
            MSME Certified · AI Product Company
          </p>
        </div>
      </div>
    </footer>
  );
}
