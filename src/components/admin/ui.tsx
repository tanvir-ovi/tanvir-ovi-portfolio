"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  Book,
  Briefcase,
  ChartBar,
  CheckCircle,
  Code,
  Compass,
  EnvelopeSimple,
  FilmStrip,
  Flask,
  GraduationCap,
  Image as ImageIcon,
  Info,
  Layout,
  MagnifyingGlass,
  Medal,
  Megaphone,
  Newspaper,
  PenNib,
  Star,
  Target,
  TextAa,
  Trophy,
  User,
  Users,
  WarningCircle,
  Wrench,
  X,
} from "@phosphor-icons/react/dist/ssr";
import type { PanelIcon } from "@/lib/admin-schema";
import { cn } from "@/lib/cn";

export const panelIcons: Record<PanelIcon, typeof User> = {
  user: User,
  compass: Compass,
  search: MagnifyingGlass,
  layout: Layout,
  star: Star,
  chart: ChartBar,
  film: FilmStrip,
  target: Target,
  text: TextAa,
  book: Book,
  news: Newspaper,
  image: ImageIcon,
  trophy: Trophy,
  code: Code,
  megaphone: Megaphone,
  briefcase: Briefcase,
  flask: Flask,
  wrench: Wrench,
  medal: Medal,
  school: GraduationCap,
  pen: PenNib,
  info: Info,
  users: Users,
  mail: EnvelopeSimple,
};

// ------------------------------------------------------------------ buttons

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Btn({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-accent text-accent-contrast hover:bg-accent-strong",
        variant === "secondary" && "border border-border-strong bg-surface text-foreground hover:bg-surface-hover",
        variant === "ghost" && "text-foreground-muted hover:bg-surface hover:text-foreground",
        variant === "danger" && "border border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-faint transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-30",
        className
      )}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------- inputs

export const inputClass =
  "w-full rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";

export function FieldShell({
  label,
  help,
  error,
  htmlFor,
  aside,
  children,
}: {
  label?: string;
  help?: string;
  error?: string;
  htmlFor?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5" data-error={error ? "true" : undefined}>
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={htmlFor} className="text-[0.8rem] font-medium text-foreground">
            {label}
          </label>
          {aside}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <WarningCircle size={13} weight="fill" />
          {error}
        </p>
      ) : help ? (
        <p className="text-xs leading-relaxed text-foreground-faint">{help}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        checked ? "border-accent/60 bg-accent/80" : "border-border-strong bg-background"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-foreground shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// -------------------------------------------------------------------- modal

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border-strong bg-background-elevated shadow-2xl outline-none sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <IconBtn label="Close" onClick={onClose}>
            <X size={16} />
          </IconBtn>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- toasts

interface Toast {
  id: number;
  tone: "ok" | "error" | "info";
  text: string;
  action?: { label: string; run: () => void };
}

const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), t.action ? 8000 : 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur",
              t.tone === "ok" && "border-emerald-400/30 bg-emerald-950/80 text-emerald-100",
              t.tone === "error" && "border-red-400/30 bg-red-950/85 text-red-100",
              t.tone === "info" && "border-border-strong bg-surface/95 text-foreground"
            )}
          >
            {t.tone === "ok" ? <CheckCircle size={18} weight="fill" className="mt-px shrink-0" /> : null}
            {t.tone === "error" ? <WarningCircle size={18} weight="fill" className="mt-px shrink-0" /> : null}
            <span className="flex-1 leading-snug">{t.text}</span>
            {t.action ? (
              <button
                type="button"
                className="shrink-0 font-semibold underline underline-offset-2"
                onClick={() => {
                  t.action?.run();
                  setToasts((list) => list.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-background-elevated p-5 sm:p-6", className)}>{children}</div>;
}
