/* A template remounts on every navigation, so each page settles in with the
 * same short rise instead of snapping. The animation ends at `transform: none`,
 * which keeps sticky and fixed children inside pages working normally. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
