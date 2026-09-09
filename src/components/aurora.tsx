import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Soft drifting aurora blooms behind the frosted glass surfaces. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="animate-aurora absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-aurora-1 opacity-40 blur-[120px]" />
      <div
        className="animate-aurora absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-aurora-2 opacity-40 blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-aurora absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-aurora-3 opacity-35 blur-[130px]"
        style={{ animationDelay: "-12s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
        }}
      />
    </div>
  );
}

export function GlassPanel({
  children,
  className,
  lift = true,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-3xl",
        lift &&
          "transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Shimmer({ label }: { label: string }) {
  return (
    <div className="glass-soft relative overflow-hidden rounded-2xl px-4 py-6 text-center">
      <div
        className="animate-shimmer absolute inset-y-0 w-1/2 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, var(--aurora-1), transparent)",
        }}
      />
      <p className="relative text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "glass-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
