import Image from "next/image";
import { profile } from "@/lib/data";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

const paragraphs = [
  `During my third year at the University of Chittagong, I was tutoring a high school student one evening when his older brother walked in. He was a senior in my department, and he started talking about his research on decoding Bengali words from EEG signals. He mentioned BrainGate, the US program where paralyzed participants had typed full sentences using only signals recorded from their motor cortex. I could not stop thinking about it. I joined his research group the following week, and EEG has been at the center of my academic life ever since.`,
  `My early projects looked at imagined speech and cognitive load. Somewhere along the way I started noticing something stranger. The same brain rhythms that are excellent at telling you what someone is thinking are often terrible at telling you who that person is. Delta band signals classify mental tasks at close to 87 percent accuracy but barely clear 20 percent when the goal shifts to recognizing the individual. Broadband signals do the opposite. That gap became the question behind most of my recent papers, and it eventually led to a phenotype-aware model that lifted cross-session emotion recognition from about 40 percent to almost 92 percent.`,
  `All of this came out of a 14-channel consumer headset running on a university budget, while labs elsewhere worked with 64-channel systems and proper shielded rooms. That constraint forced a certain kind of discipline. You learn to pull real signal out of limited data instead of throwing more hardware at the problem, and that habit has stuck with me.`,
  `Before EEG, I was building robots. My team won the Robo Soccer Competition at EEE Fest in 2023, and we placed second the year before that. Debugging a system in real time, under a deadline, with a crowd watching, turned out to be decent preparation for debugging a preprocessing pipeline at two in the morning before a submission deadline.`,
  `Right now I am finishing my BSc and applying to graduate research positions, mostly PhD and a few research master's programs, across several countries. The plan after that has not changed in a while. I want to come back to Bangladesh and start a small lab focused on assistive brain-computer interfaces, beginning with patients who have motor neuron disease and currently get very little support in our health system. The papers, the applications, the late nights with noisy EEG recordings, all of it is really in service of that.`,
];

export function Bio() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* One section-level reveal for the whole narrative - no per-paragraph animation */}
          <Reveal className="order-2 space-y-5 lg:order-1">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-balance text-base leading-relaxed text-foreground-muted">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={0.05}>
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-border-strong bg-surface">
              <div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
                style={{
                  background:
                    "radial-gradient(120% 80% at 50% 0%, rgba(56,189,248,0.22), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <Image
                src="/images/portrait.jpg"
                alt={`Portrait of ${profile.name}`}
                width={2780}
                height={2629}
                priority
                quality={92}
                sizes="(min-width: 1024px) 22rem, 80vw"
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </div>
          </Reveal>
        </div>

        {/* Thesis band - the bound undergraduate EEG thesis that started the work */}
        <Reveal className="mt-16 grid gap-10 border-t border-border pt-14 sm:grid-cols-[18rem_1fr] sm:items-center sm:gap-12">
          <figure className="relative mx-auto w-full max-w-[18rem] overflow-hidden rounded-2xl border border-border-strong bg-surface">
            <Image
              src="/images/thesis-portrait.png"
              alt={`${profile.name} holding his bound BSc thesis`}
              width={1081}
              height={1301}
              quality={92}
              sizes="(min-width: 640px) 18rem, 80vw"
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </figure>
          <div>
            <p className="font-display text-2xl italic leading-snug text-foreground sm:text-[2rem]">
              &ldquo;EEG-Based Cognitive Load Analysis in Immersive Virtual Reality and
              Laptop-Based Video Learning Environments.&rdquo;
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted">
              My bound undergraduate thesis, Department of Electrical &amp; Electronic
              Engineering, University of Chittagong (2024). Thirty participants watched the same
              video on a 2D laptop or in 360&deg; VR while wearing a 14-channel headset. Immersion
              lowered cognitive load and raised engagement. That was the first question that
              pulled me into reading the mind from its signals.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
