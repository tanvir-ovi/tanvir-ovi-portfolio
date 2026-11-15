import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { SplitWords } from "./ui/SplitWords";
import { GlowOrbs } from "./NeuralField";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <GlowOrbs />
      <Container className="relative py-20 sm:py-28">
        <Reveal variant="group">
          <p data-rise className="eyebrow-mono mb-4 flex items-center gap-2.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            {eyebrow}
          </p>
          <h1 className="font-display text-balance text-3xl font-normal tracking-tight text-foreground sm:text-5xl">
            <SplitWords text={title} />
          </h1>
          <p
            data-rise
            style={{ "--d": "0.32s" } as React.CSSProperties}
            className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-foreground-muted sm:text-lg"
          >
            {description}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
