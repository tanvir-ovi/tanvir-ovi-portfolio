import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const setups = [
  {
    src: "/images/experiment-vr.png",
    width: 791,
    height: 788,
    alt: "Tanvir wearing a Meta Quest 3 VR headset fitted with EEG sensors during an immersive cognitive load experiment",
    label: "360° VR condition",
    detail: "Meta Quest 3 + 14-channel Emotiv EPOC X",
  },
  {
    src: "/images/experiment-laptop.png",
    width: 629,
    height: 662,
    alt: "Tanvir wearing a 14-channel Emotiv EPOC X EEG headset during a laptop-based cognitive load experiment",
    label: "2D laptop condition",
    detail: "Laptop display + 14-channel Emotiv EPOC X",
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
              <figure key={setup.label} className="group overflow-hidden rounded-lg border border-border transition-colors duration-500 hover:border-accent/20">
                {/* Cyan hairline - brightens on hover */}
                <div className="h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent transition-[opacity] duration-500 group-hover:via-accent/75" />
                {/* overflow-hidden clips the scale-up so it crops instead of overflowing */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-background-elevated p-8">
                  <Image
                    src={setup.src}
                    alt={setup.alt}
                    width={setup.width}
                    height={setup.height}
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className="h-full w-auto object-contain contrast-[1.05] saturate-[0.92] drop-shadow-[0_20px_36px_rgba(2,6,23,0.55)] transition-transform duration-700 ease-in-out group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="border-t border-border px-6 py-5 transition-colors duration-500 group-hover:border-accent/15">
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
