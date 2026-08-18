import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(57,100,254,0.55)] hover:bg-primary/90 hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_2px_4px_rgba(0,0,0,0.08),0_10px_24px_-8px_rgba(57,100,254,0.6)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(236,19,19,0.5)] hover:bg-destructive/90",
        outline:
          "border border-input bg-card/60 text-foreground shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:border-ring/40 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(0,0,0,0.04)] hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
