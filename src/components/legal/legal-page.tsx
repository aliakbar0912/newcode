import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";

export interface LegalSection {
  id: string;
  heading: string;
  /** Each item: a paragraph, or a bullet list. */
  blocks: Array<
    | { type: "p"; text: string }
    | { type: "list"; items: string[] }
  >;
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={`Last updated: ${updated}`}
      />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Reveal>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </Reveal>

        <div className="mt-12 space-y-12">
          {sections.map((section) => (
            <Reveal key={section.id}>
              <section id={section.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.blocks.map((block, i) =>
                    block.type === "p" ? (
                      <p
                        key={i}
                        className="text-[15px] leading-relaxed text-muted-foreground"
                      >
                        {block.text}
                      </p>
                    ) : (
                      <ul key={i} className="list-disc space-y-2 pl-5">
                        {block.items.map((item, j) => (
                          <li
                            key={j}
                            className="text-[15px] leading-relaxed text-muted-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Questions about this document?{" "}
            <Link href="/support" className="text-zinc-300 underline-offset-4 hover:underline">
              Contact support
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </>
  );
}
