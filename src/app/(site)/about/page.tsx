import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Bio } from "@/components/about/Bio";
import { QuickFacts } from "@/components/about/QuickFacts";
import { References } from "@/components/about/References";
import { CtaBanner } from "@/components/CtaBanner";
import { site } from "@/lib/data";

const page = site.about;

export const metadata: Metadata = {
  title: page.seo.title,
  description: page.seo.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader {...page.header} />
      <Bio />
      <QuickFacts />
      {page.references.visible ? <References /> : null}
      <CtaBanner title={page.cta.title} description={page.cta.description} />
    </>
  );
}
