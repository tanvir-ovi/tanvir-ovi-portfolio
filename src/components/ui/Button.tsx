import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-colors motion-reduce:active:scale-100";

const variants = {
  primary:
    "btn-shine bg-accent text-accent-contrast hover:bg-accent-strong hover:-translate-y-px shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_6px_18px_-6px_rgba(56,189,248,0.5)] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_10px_26px_-6px_rgba(56,189,248,0.6)] motion-reduce:hover:translate-y-0",
  secondary:
    "border border-border-strong bg-surface text-foreground hover:bg-surface-hover hover:border-accent/40 hover:-translate-y-px motion-reduce:hover:translate-y-0",
  ghost: "text-foreground-muted hover:text-foreground",
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  icon,
  external,
}: ButtonBaseProps & { href: string; external?: boolean }) {
  const classes = cn(base, variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      {icon}
    </Link>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  icon,
  type = "button",
  disabled,
  onClick,
}: ButtonBaseProps & {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant], disabled && "opacity-50", className)}
    >
      {children}
      {icon}
    </button>
  );
}
