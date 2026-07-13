import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * NextGen Labs — LOCKED BRAND ASSET
 *
 * Renders the official uploaded (transparent) logo directly from
 * public/logo.png. No recreation, no color / typography / spacing /
 * proportion changes — only trimmed of empty transparent padding so it
 * fills its box. Aspect ratio is always preserved (object-contain).
 *
 * Size is controlled by height via `className` (e.g. h-12 / h-14).
 * ------------------------------------------------------------------ */

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className, alt = "NextGen Labs" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      draggable={false}
      className={cn("w-auto object-contain", className)}
    />
  );
}
