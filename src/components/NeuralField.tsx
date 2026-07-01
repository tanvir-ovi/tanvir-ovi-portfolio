/**
 * Single restrained ambient glow used behind inner-page headers.
 * Pure CSS, no canvas or WebGL, kept deliberately quiet so it reads as
 * atmosphere rather than decoration.
 */
export function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="animate-drift absolute -left-24 top-[-8%] h-[28rem] w-[28rem] rounded-full opacity-18 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.50) 0%, rgba(56,189,248,0) 70%)",
        }}
      />
      <div
        className="animate-drift absolute right-[-12%] top-[15%] h-[22rem] w-[22rem] rounded-full opacity-12 blur-[115px]"
        style={{
          animationDelay: "-7s",
          background:
            "radial-gradient(circle, rgba(125,211,252,0.45) 0%, rgba(125,211,252,0) 70%)",
        }}
      />
    </div>
  );
}
