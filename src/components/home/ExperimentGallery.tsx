import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

// Studio cut-outs (white background keyed to alpha) so each subject stands
// on the dark stage instead of sitting in a white box.
const setups = [
  {
    src: "/images/experiment-vr.webp",
    width: 791,
    height: 788,
    alt: "Tanvir wearing a Meta Quest 3 VR headset fitted with EEG sensors during an immersive cognitive load experiment",
    tag: "Condition A",
    label: "360° VR condition",
    detail: "Meta Quest 3 + 14-channel Emotiv EPOC X",
    glow: "rgba(56,189,248,0.34)",
  },
  {
    src: "/images/experiment-laptop.webp",
    width: 629,
    height: 662,
    alt: "Tanvir wearing a 14-channel Emotiv EPOC X EEG headset during a laptop-based cognitive load experiment",
    tag: "Condition B",
    label: "2D laptop condition",
    detail: "Laptop display + 14-channel Emotiv EPOC X",
    glow: "rgba(139,125,255,0.34)",
  },
];

export function ExperimentGallery() {
  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="From signal to system"
          title="Inside the experimental setup"
          description="Both conditions of the cognitive load study used the same 14-channel dry EEG headset, so the only variable was the display: a 2D laptop screen or a fully immersive VR headset."
        />

        <Reveal className="mt-12 grid gap-6 sm:grid-cols-2">
          {setups.map((setup) => (
            <figure
              key={setup.label}
              className="group overflow-hidden rounded-2xl border border-border bg-background-elevated transition-colors duration-500 hover:border-accent/25"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Faint instrument grid, fading out toward the edges */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(226,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(226,240,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage: "radial-gradient(75% 70% at 50% 40%, #000 30%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(75% 70% at 50% 40%, #000 30%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
                {/* Key light behind the head */}
                <div
                  className="pointer-events-none absolute left-1/2 top-[34%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${setup.glow} 0%, transparent 65%)` }}
                  aria-hidden="true"
                />
                <Image
                  src={setup.src}
                  alt={setup.alt}
                  width={setup.width}
                  height={setup.height}
                  sizes="(min-width: 1152px) 420px, (min-width: 640px) 36vw, 70vw"
                  className="absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 origin-bottom object-contain drop-shadow-[0_24px_40px_rgba(2,6,23,0.6)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
                {/* The torso is cropped by the frame, so let it dissolve into the caption */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background-elevated via-background-elevated/60 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute left-5 top-5 rounded-full border border-border-strong bg-background/60 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground-muted backdrop-blur-sm">
                  {setup.tag}
                </span>
              </div>
              <figcaption className="relative border-t border-border px-6 py-5">
                <div
                  className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-foreground">{setup.label}</p>
                <p className="mt-1 text-xs text-foreground-faint">{setup.detail}</p>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
