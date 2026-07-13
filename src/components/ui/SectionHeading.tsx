import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "eyebrow-mono mb-4 flex items-center gap-2.5",
            align === "center" && "justify-center"
          )}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-balance text-3xl font-normal tracking-tight text-foreground sm:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-balance text-base leading-relaxed text-foreground-muted">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
