import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const baseButton =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.08em] transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-[var(--accent-text)] text-[var(--game-accent-ink)] shadow-[0_12px_32px_var(--accent-glow)]",
    secondary: "border border-subtle bg-[color:var(--surface-subtle)] text-primary hover:bg-[color:var(--surface-hover)]",
    ghost: "text-secondary hover:bg-[color:var(--surface-subtle)] hover:text-primary",
    danger: "border border-[var(--coral)]/40 bg-[var(--coral)]/10 text-[var(--coral)]",
  };
  return <button className={`${baseButton} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Route;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary:
      "bg-[var(--accent-text)] text-[var(--game-accent-ink)] shadow-[0_12px_32px_var(--accent-glow)]",
    secondary: "border border-subtle bg-[color:var(--surface-subtle)] text-primary",
    ghost: "text-secondary hover:bg-[color:var(--surface-subtle)] hover:text-primary",
  };
  return (
    <Link className={`${baseButton} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-bold ${className}`}>
      <span>{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-xs font-semibold text-[var(--coral)]">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs font-medium text-tertiary">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClassName =
  "min-h-14 w-full rounded-2xl border border-subtle bg-[color:var(--surface-subtle)] px-4 text-base font-semibold text-primary placeholder:text-quaternary transition focus:border-[var(--lime)] focus:bg-[color:var(--surface-hover)] focus:outline-none";

export const compactInputClassName =
  "min-h-11 w-full rounded-xl border border-subtle bg-[color:var(--surface-subtle)] px-3 text-base font-semibold text-primary placeholder:text-quaternary transition focus:border-[var(--lime)] focus:bg-[color:var(--surface-hover)] focus:outline-none";

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Tour ${current} sur ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index < current ? "bg-[var(--lime)]" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}
