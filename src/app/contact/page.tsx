import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Tanvir Hossain Ovi for research collaboration or questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        description="If you're reviewing one of my graduate applications, considering a research collaboration, or just curious about EEG-based emotion recognition, send a message."
      />
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            <Reveal>
              <ContactForm />
            </Reveal>
            <ContactSidebar />
          </div>
        </Container>
      </section>
    </>
  );
}
