import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-gradient text-white shadow-[0_8px_30px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_44px_rgba(99,102,241,0.5)] hover:-translate-y-0.5",
        solid:
          "bg-black text-white dark:bg-white dark:text-black hover:opacity-90 hover:-translate-y-0.5",
        glass:
          "glass-strong text-current hover:-translate-y-0.5 hover:bg-white/10",
        ghost:
          "text-current/70 hover:text-current hover:bg-black/5 dark:hover:bg-white/5",
        outline:
          "border border-current/15 text-current hover:border-current/30 hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6",
        lg: "h-[52px] px-8 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
