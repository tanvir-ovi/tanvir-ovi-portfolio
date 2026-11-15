import { Fragment } from "react";

/* Splits a heading into words that each rise out of their own mask, the same
 * move the hero headline makes. Must sit inside <Reveal variant="group">,
 * which flips the words in when the heading scrolls into view. Spaces stay
 * real text nodes, so wrapping, text-balance and screen readers are unchanged. */
export function SplitWords({ text }: { text: string }) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => (
      <Fragment key={`${word}-${i}`}>
        <span className="word-mask">
          <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
        </span>{" "}
      </Fragment>
    ));
}
