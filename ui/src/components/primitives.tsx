/**
 * Small shared building blocks.
 *
 * Every colour here comes from a CSS custom property defined in `index.css`,
 * never a hard-coded hex, so light and dark stay in step without a second set
 * of class names.
 */

import type { ReactNode } from "react";
import type { SafetyClass } from "../types";
import { safetyBlurb, safetyLabel } from "../i18n";
import type { Locale } from "../types";

/* -------------------------------------------------------------- Panel --- */

export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border ${padded ? "p-4" : ""} ${className}`}
      style={{
        background: "var(--surface-panel)",
        borderColor: "var(--border-subtle)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------- Button --- */

type ButtonVariant = "primary" | "danger" | "ghost" | "outline";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-45";

export function Button({
  children,
  onClick,
  variant = "outline",
  disabled,
  title,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  title?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      // Token primary + on-primary (QU-STD-1): Tối = tím #A970FF với mực đen, Sáng = #7C3AED với chữ trắng
      background: "var(--primary)",
      color: "var(--on-primary)",
      borderColor: "var(--primary-hover)",
    },
    // Token danger + on-status: the old brand orange gave white text 4.2:1.
    danger: {
      background: "var(--danger)",
      color: "var(--on-status)",
      borderColor: "var(--danger)",
    },
    outline: {
      background: "transparent",
      color: "var(--text-primary)",
      // An interactive edge: border-control, not the decorative border-strong.
      borderColor: "var(--border-control)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      borderColor: "transparent",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${BUTTON_BASE} border ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------- SafetyBadge --- */

/**
 * Colour is never the only signal: each class also carries a distinct glyph
 * and its own word, so the badge survives a monochrome screenshot and does
 * not depend on the viewer distinguishing green from amber.
 */
const SAFETY_STYLE: Record<
  SafetyClass,
  { glyph: string; fg: string; bg: string; border: string }
> = {
  // Status tokens, not the brand palette: they hold 4.5:1 in every theme
  // (DESIGN_SYSTEM.md section 1). Colour never stands alone - glyph + label.
  safe: {
    glyph: "✓",
    fg: "var(--success)",
    bg: "var(--bg-surface)",
    border: "color-mix(in srgb, var(--success) 45%, transparent)",
  },
  caution: {
    glyph: "!",
    fg: "var(--warning)",
    bg: "var(--bg-surface)",
    border: "color-mix(in srgb, var(--warning) 45%, transparent)",
  },
  unknown: {
    glyph: "?",
    fg: "var(--text-secondary)",
    bg: "var(--bg-subtle)",
    border: "var(--border-strong)",
  },
  critical: {
    glyph: "⛊",
    fg: "var(--danger)",
    bg: "var(--bg-surface)",
    border: "color-mix(in srgb, var(--danger) 45%, transparent)",
  },
};

export function SafetyBadge({
  safety,
  locale,
  compact = false,
}: {
  safety: SafetyClass;
  locale: Locale;
  compact?: boolean;
}) {
  const style = SAFETY_STYLE[safety];
  return (
    <span
      title={safetyBlurb(locale, safety)}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border font-medium ${
        compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
      }`}
      style={{ color: style.fg, background: style.bg, borderColor: style.border }}
    >
      <span aria-hidden="true">{style.glyph}</span>
      {safetyLabel(locale, safety)}
    </span>
  );
}

/* ---------------------------------------------------------------- Tag --- */

export function Tag({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px]"
      style={{
        background: "var(--surface-sunken)",
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- Modal --- */

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = "max-w-3xl",
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgb(4 12 20 / 0.55)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[85vh] w-full ${width} flex-col overflow-hidden rounded-xl border`}
        style={{
          background: "var(--surface-panel)",
          borderColor: "var(--border-strong)",
          boxShadow: "0 24px 64px rgb(0 0 0 / 0.35)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-lg leading-none"
            style={{ color: "var(--text-muted)" }}
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer
            className="flex items-center justify-end gap-2 border-t px-5 py-3"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--surface-sunken)",
            }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Notice --- */

export function Notice({
  tone,
  title,
  children,
  action,
}: {
  tone: "info" | "warning" | "danger" | "success";
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    info: { accent: "var(--info)", glyph: "i" },
    success: { accent: "var(--success)", glyph: "✓" },
    warning: { accent: "var(--warning)", glyph: "!" },
    danger: { accent: "var(--danger)", glyph: "⛊" },
  } as const;
  const { accent, glyph } = tones[tone];

  return (
    <div
      className="flex items-start gap-3 rounded-lg border px-3.5 py-3"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
        background: `color-mix(in srgb, ${accent} 8%, transparent)`,
      }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: accent, color: "#fff" }}
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && (
          <div className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ Spinner --- */

export function ProgressBar({ value }: { value?: number }) {
  const indeterminate = value === undefined;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full"
      style={{ background: "var(--surface-sunken)" }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(value * 100)}
    >
      <div
        className={`h-full rounded-full ${indeterminate ? "w-1/4 animate-sweep" : ""}`}
        style={{
          background: "var(--primary)",
          width: indeterminate ? undefined : `${Math.round(value * 100)}%`,
          transition: indeterminate ? undefined : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
