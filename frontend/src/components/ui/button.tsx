import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "gradient"
    | "dark";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const buttonVariants = {
  variant: {
    default:
      "bg-brand-blue text-white shadow-sm hover:bg-brand-blue-deep active:scale-[0.98] transition-all",
    destructive:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition-all",
    outline:
      "border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98] transition-all",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:scale-[0.98] transition-all",
    ghost:
      "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all",
    link:
      "text-brand-blue underline-offset-4 hover:underline",
    gradient:
      "bg-gradient-to-r from-brand-blue via-sky-600 to-brand-blue text-white shadow-md shadow-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all",
    dark:
      "bg-slate-900 text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all",
  },
  size: {
    default: "h-10 px-4 py-2 text-sm rounded-xl",
    sm: "h-8 px-3 text-xs rounded-lg",
    lg: "h-12 px-6 sm:px-8 text-base rounded-2xl font-bold",
    icon: "h-10 w-10 rounded-xl",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
