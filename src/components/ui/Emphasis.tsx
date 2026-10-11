import { Fragment } from "react";

/* Renders site copy where words wrapped in *asterisks* get the italic aurora
 * accent, e.g. "into *understanding*." This keeps the highlight editable from
 * the admin panel without storing markup in the content file. */
export function Emphasis({
  text,
  className = "italic text-aurora",
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : part ? (
          <Fragment key={i}>{part}</Fragment>
        ) : null
      )}
    </>
  );
}
