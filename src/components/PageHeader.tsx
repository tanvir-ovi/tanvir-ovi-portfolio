import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
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
        <Reveal>
          <p className="mb-3 text-sm font-medium text-accent-strong">{eyebrow}</p>
          <h1 className="font-display text-balance text-3xl font-normal tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-foreground-muted sm:text-lg">
            {description}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
