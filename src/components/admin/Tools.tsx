"use client";

import { useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  ClipboardText,
  DownloadSimple,
  FilePdf,
  GitBranch,
  HardDrives,
  Keyboard,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { lintContent, validateContent, type Problem } from "@/lib/admin-schema";
import type { SiteContent } from "@/lib/content-types";
import { describePath, timeAgo, type HistoryEntry, type Session } from "./lib";
import { Hint } from "./Fields";
import { Btn, Card, inputClass, useToast } from "./ui";

// ------------------------------------------------------------------ overview

export function Overview({
  content,
  session,
  history,
  dirtyCount,
  go,
}: {
  content: SiteContent;
  session: Session;
  history: HistoryEntry[] | null;
  dirtyCount: number;
  go: (panelId: string, path?: string) => void;
}) {
  const warnings = lintContent(content);
  const errors = validateContent(content);
  const pubs = content.research.publications;
  const last = history?.[0];

  const stats = [
    { label: "Publications", value: pubs.length, panel: "research-pubs" },
    { label: "Published", value: pubs.filter((p) => p.status === "Published").length, panel: "research-pubs" },
    { label: "News items", value: content.home.news.items.length, panel: "home-news" },
    { label: "Projects", value: content.home.builds.projects.length, panel: "home-builds" },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <p className="eyebrow-mono">Welcome back</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">{content.profile.name}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-muted">
          Everything on the website is editable from the menu on the left. Changes stay as a private draft on this
          device until you press <strong className="text-foreground">Publish</strong>. The live site then rebuilds in
          about a minute.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {session.mode === "github" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              <GitBranch size={13} /> Connected to {session.repo} · {session.branch}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">
              <HardDrives size={13} /> Local mode: saves go to this computer&apos;s files
            </span>
          )}
          {last ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 text-foreground-muted">
              Last published {timeAgo(last.date)}
            </span>
          ) : null}
          {dirtyCount ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-accent-strong">
              {dirtyCount} unpublished change{dirtyCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => go(s.panel)}
            className="rounded-xl border border-border bg-background-elevated p-4 text-left transition-colors hover:border-border-strong"
          >
            <span className="block font-display text-3xl tabular-nums text-foreground">{s.value}</span>
            <span className="mt-1 block text-xs text-foreground-faint">{s.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {errors.length + warnings.length === 0 ? (
            <CheckCircle size={17} weight="fill" className="text-emerald-300" />
          ) : (
            <Warning size={17} weight="fill" className="text-amber-300" />
          )}
          Content check
        </h3>
        {errors.length + warnings.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">Everything looks consistent. No missing descriptions, broken numbers or empty sections.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {[...errors.map((p) => ({ ...p, level: "error" as const })), ...warnings.map((p) => ({ ...p, level: "warn" as const }))].map(
              (p: Problem & { level: "error" | "warn" }, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5">
                  <span className={p.level === "error" ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300"} />
                  <span className="flex-1 text-sm text-foreground-muted">
                    <span className="block text-xs text-foreground-faint">{describePath(p.path, content)}</span>
                    {p.message}
                  </span>
                  <button type="button" onClick={() => go(p.panel, p.path)} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent-strong hover:underline">
                    Fix <ArrowRight size={12} />
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold text-foreground">Common jobs</h3>
          <ul className="mt-3 space-y-1">
            {[
              ["Add a new paper", "research-pubs"],
              ["Post a news item", "home-news"],
              ["Update the CV PDF", "files"],
              ["Change the hero text", "home-hero"],
              ["Hide or reorder home sections", "home-layout"],
              ["Edit your story", "about-bio"],
            ].map(([label, id]) => (
              <li key={id}>
                <button type="button" onClick={() => go(id)} className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface hover:text-foreground">
                  {label}
                  <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Keyboard size={16} /> Shortcuts
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Ctrl + S", "Review and publish"],
              ["Ctrl + K", "Find a section"],
              ["Esc", "Close a dialog"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">{v}</dt>
                <dd>
                  <kbd className="rounded-md border border-border-strong bg-surface px-2 py-0.5 font-mono text-xs text-foreground">{k}</kbd>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-foreground-faint">
            Wrap words in *asterisks* in the hero and award titles to give them the gradient italic.
          </p>
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------- files

export function Files({
  content,
  session,
  onStageCv,
  uploadImage,
  pendingCv,
}: {
  content: SiteContent;
  session: Session;
  onStageCv: (file: File) => Promise<void>;
  uploadImage: (file: File) => Promise<{ url: string; width: number; height: number }>;
  pendingCv: boolean;
}) {
  const toast = useToast();
  const cvRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"cv" | "img" | null>(null);
  const [uploaded, setUploaded] = useState<{ url: string; width: number; height: number }[]>([]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong bg-surface text-accent-strong">
              <FilePdf size={20} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">CV</h3>
              <p className="mt-1 font-mono text-xs text-foreground-faint">{content.profile.cvPath}</p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-foreground-muted">
                Uploading replaces the PDF at the same address, so every &quot;Download CV&quot; button and any link you
                have already emailed keeps working.
              </p>
              {pendingCv ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-xs text-accent-strong">
                  New CV ready, goes live when you publish
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <a href={content.profile.cvPath} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-foreground-muted hover:bg-surface hover:text-foreground">
              Current <ArrowSquareOut size={14} />
            </a>
            <input
              ref={cvRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy("cv");
                try {
                  await onStageCv(file);
                } catch (err) {
                  toast({ tone: "error", text: (err as Error).message });
                } finally {
                  setBusy(null);
                }
              }}
            />
            <Btn variant="primary" icon={<UploadSimple size={15} />} disabled={busy === "cv"} onClick={() => cvRef.current?.click()}>
              {busy === "cv" ? "Uploading…" : "Upload new CV"}
            </Btn>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pictures</h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-foreground-muted">
              Every photo field has its own upload button. Use this to get an address for a picture you want to paste
              somewhere else. Large photos are resized to 2400 px and converted to WebP automatically.
            </p>
          </div>
          <input
            ref={imgRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy("img");
              try {
                const res = await uploadImage(file);
                setUploaded((u) => [res, ...u]);
              } catch (err) {
                toast({ tone: "error", text: (err as Error).message });
              } finally {
                setBusy(null);
              }
            }}
          />
          <Btn icon={<UploadSimple size={15} />} disabled={busy === "img"} onClick={() => imgRef.current?.click()}>
            {busy === "img" ? "Uploading…" : "Upload picture"}
          </Btn>
        </div>
        {uploaded.length ? (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {uploaded.map((u) => (
              <li key={u.url} className="flex items-center gap-3 py-3">
                <code className="flex-1 truncate text-xs text-foreground">{u.url}</code>
                <span className="text-xs text-foreground-faint">
                  {u.width} × {u.height}
                </span>
                <Btn
                  size="sm"
                  variant="ghost"
                  icon={<ClipboardText size={13} />}
                  onClick={() => {
                    navigator.clipboard?.writeText(u.url);
                    toast({ tone: "ok", text: "Address copied." });
                  }}
                >
                  Copy
                </Btn>
              </li>
            ))}
          </ul>
        ) : null}
        {session.mode === "github" ? (
          <div className="mt-4">
            <Hint>Uploaded pictures are attached to your next publish. Until then they show in the editor only.</Hint>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------- history

export function History({
  session,
  history,
  reload,
  onLoadVersion,
}: {
  session: Session;
  history: HistoryEntry[] | null;
  reload: () => void;
  onLoadVersion: (entry: HistoryEntry) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  if (session.mode !== "github") {
    return (
      <Card>
        <p className="text-sm text-foreground-muted">
          Version history is kept in GitHub, so it appears once the editor runs on the live site. In local mode, use
          git on this computer.
        </p>
      </Card>
    );
  }
  return (
    <Card className="p-0 sm:p-0">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <p className="text-xs text-foreground-faint">
          Each publish is saved as a version. Opening one loads it into the editor; publish it to roll the site back.
        </p>
        <Btn size="sm" variant="ghost" icon={<ArrowCounterClockwise size={13} />} onClick={reload}>
          Refresh
        </Btn>
      </div>
      {history === null ? (
        <p className="px-5 py-6 text-sm text-foreground-faint">Loading…</p>
      ) : history.length === 0 ? (
        <p className="px-5 py-6 text-sm text-foreground-faint">No versions yet.</p>
      ) : (
        <ol className="divide-y divide-border">
          {history.map((h, i) => (
            <li key={h.sha} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
              <span className="w-24 shrink-0 text-xs text-foreground-faint" title={new Date(h.date).toLocaleString()}>
                {timeAgo(h.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {h.message}
                {i === 0 ? <span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[0.65rem] text-emerald-200">live</span> : null}
              </span>
              <a
                href={`https://github.com/${session.repo}/commit/${h.sha}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-foreground-faint hover:text-foreground"
              >
                {h.sha.slice(0, 7)}
              </a>
              <Btn
                size="sm"
                variant="secondary"
                disabled={loading !== null}
                onClick={async () => {
                  setLoading(h.sha);
                  try {
                    await onLoadVersion(h);
                  } catch (err) {
                    toast({ tone: "error", text: (err as Error).message });
                  } finally {
                    setLoading(null);
                  }
                }}
              >
                {loading === h.sha ? "Opening…" : "Open"}
              </Btn>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

// ------------------------------------------------------------------ advanced

export function Advanced({
  content,
  onReplace,
}: {
  content: SiteContent;
  onReplace: (next: SiteContent) => void;
}) {
  const toast = useToast();
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [problems, setProblems] = useState<Problem[]>([]);
  const importRef = useRef<HTMLInputElement>(null);

  const apply = (raw: string) => {
    let parsed: SiteContent;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      toast({ tone: "error", text: `Not valid JSON: ${(err as Error).message}` });
      return;
    }
    const found = validateContent(parsed);
    setProblems(found);
    if (found.length) {
      toast({ tone: "error", text: `${found.length} problem${found.length === 1 ? "" : "s"} found. Nothing was changed.` });
      return;
    }
    onReplace(parsed);
    toast({ tone: "ok", text: "Applied to the draft. Review and publish when ready." });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Btn
            icon={<DownloadSimple size={15} />}
            onClick={() => {
              const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `site-content-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Download backup
          </Btn>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const raw = await file.text();
              setText(raw);
              apply(raw);
            }}
          />
          <Btn icon={<UploadSimple size={15} />} onClick={() => importRef.current?.click()}>
            Restore from backup
          </Btn>
        </div>
        <p className="mt-3 text-xs text-foreground-faint">
          A backup is the whole site as one file. Restoring loads it into the draft; nothing goes live until you publish.
        </p>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Raw content</h3>
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" onClick={() => setText(JSON.stringify(content, null, 2))}>
              Reset
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => apply(text)}>
              Apply to draft
            </Btn>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className={`${inputClass} h-[60vh] resize-y font-mono text-[0.75rem] leading-relaxed`}
        />
        {problems.length ? (
          <ul className="mt-3 space-y-1 text-xs text-red-300">
            {problems.slice(0, 12).map((p, i) => (
              <li key={i}>
                {p.path}: {p.message}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
