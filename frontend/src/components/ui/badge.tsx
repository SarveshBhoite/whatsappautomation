import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "brand"
    | "warning";
}

const badgeVariants = {
  default:
    "border-transparent bg-slate-900 text-white shadow-xs",
  secondary:
    "border-slate-200 bg-slate-100 text-slate-800",
  destructive:
    "border-transparent bg-red-50 text-red-700 border-red-200",
  outline:
    "border-slate-200 text-slate-800 bg-white shadow-2xs",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  brand:
    "border-sky-200 bg-sky-50 text-brand-blue-deep",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
