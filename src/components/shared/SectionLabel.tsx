import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "type-eyebrow inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-muted",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-gradient" />
      {children}
    </span>
  );
}
