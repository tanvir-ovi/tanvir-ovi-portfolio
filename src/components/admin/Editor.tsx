"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowSquareOut,
  ArrowUUpLeft,
  BracketsCurly,
  CheckCircle,
  CircleNotch,
  ClockCounterClockwise,
  CloudArrowUp,
  Eye,
  FolderOpen,
  House,
  List,
  MagnifyingGlass,
  SignOut,
  Warning,
  WarningCircle,
  X,
} from "@phosphor-icons/react/dist/ssr";
import {
  getPath,
  panels,
  setPath,
  validateContent,
  type Field,
  type Panel,
  type Problem,
} from "@/lib/admin-schema";
import type { SiteContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import {
  api,
  ApiError,
  deepEqual,
  diffContent,
  preview,
  prepareImage,
  readDraft,
  timeAgo,
  writeDraft,
  type DeployState,
  type HistoryEntry,
  type Session,
  type StagedUpload,
  type StoredDraft,
} from "./lib";
import { FieldContext, FieldList, type FieldCtx } from "./Fields";
import { Advanced, Files, History, Overview } from "./Tools";
import { Btn, Card, inputClass, Modal, panelIcons, useToast } from "./ui";

type ToolId = "overview" | "files" | "history" | "advanced";
const tools: { id: ToolId; title: string; description: string; icon: typeof House }[] = [
  { id: "files", title: "Files", description: "Replace the CV PDF and upload pictures.", icon: FolderOpen },
  { id: "history", title: "History", description: "Every published version, ready to restore.", icon: ClockCounterClockwise },
  { id: "advanced", title: "Backup & raw data", description: "Download or restore the whole site as one file.", icon: BracketsCurly },
];

interface Deploy {
  sha: string;
  target: "live" | "preview";
  state: DeployState;
  url: string | null;
  startedAt: number;
}

function fieldLabels(fields: Field[]): string[] {
  return fields.flatMap((f) => [
    "label" in f ? f.label : "",
    ...(f.type === "object" || f.type === "list" ? fieldLabels(f.fields) : []),
  ]);
}

export function Editor({ session, onSignedOut }: { session: Session; onSignedOut: () => void }) {
  const toast = useToast();
  const [base, setBase] = useState<{ content: SiteContent; version: string } | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [uploads, setUploads] = useState<StagedUpload[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("overview");
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState<"live" | "preview" | null>(null);
  const [serverProblems, setServerProblems] = useState<Problem[]>([]);
  const [conflict, setConflict] = useState(false);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(() => (session.mode === "github" ? null : []));
  const [restore, setRestore] = useState<StoredDraft | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const previews = useRef(new Map<string, string>());
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        toast({ tone: "info", text: "Your session ended. Sign in again; your draft is kept on this device." });
        onSignedOut();
        return;
      }
      toast({ tone: "error", text: (err as Error).message });
    },
    [onSignedOut, toast]
  );

  // ------------------------------------------------------------ loading
  const applyLoaded = useCallback((res: { content: SiteContent; version: string }) => {
    setBase(res);
    setDraft(res.content);
    setUploads([]);
    setLoadError(null);
    const stored = readDraft();
    if (stored && !deepEqual(stored.content, res.content)) setRestore(stored);
    else if (stored) writeDraft(null);
  }, []);

  const loadFailed = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) return onSignedOut();
      setLoadError((err as Error).message);
    },
    [onSignedOut]
  );

  const load = useCallback(() => {
    api<{ content: SiteContent; version: string }>("content").then(applyLoaded, loadFailed);
  }, [applyLoaded, loadFailed]);

  useEffect(() => {
    let live = true;
    api<{ content: SiteContent; version: string }>("content").then(
      (res) => live && applyLoaded(res),
      (err) => live && loadFailed(err)
    );
    return () => {
      live = false;
    };
  }, [applyLoaded, loadFailed]);

  const loadHistory = useCallback(() => {
    if (session.mode !== "github") return;
    api<{ entries: HistoryEntry[] }>("history").then(
      (res) => setHistory(res.entries),
      (err) => {
        setHistory([]);
        handleError(err);
      }
    );
  }, [session.mode, handleError]);

  useEffect(() => {
    if (session.mode !== "github") return;
    let live = true;
    api<{ entries: HistoryEntry[] }>("history").then(
      (res) => live && setHistory(res.entries),
      () => live && setHistory([])
    );
    return () => {
      live = false;
    };
  }, [session.mode]);

  // ---------------------------------------------------------- derived
  const changes = useMemo(() => (base && draft ? diffContent(base.content, draft) : []), [base, draft]);
  const dirtyCount = changes.length + uploads.length;
  const dirtyPanels = useMemo(() => new Set(changes.map((c) => c.panel?.id).filter(Boolean)), [changes]);
  const problems = useMemo(() => (draft ? validateContent(draft) : []), [draft]);
  const errorMap = useMemo(() => new Map(problems.map((p) => [p.path, p.message])), [problems]);
  const errorsByPanel = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of problems) m.set(p.panel, (m.get(p.panel) ?? 0) + 1);
    return m;
  }, [problems]);

  // Autosave the draft on this device so a closed tab loses nothing.
  useEffect(() => {
    if (!base || !draft || restore) return;
    const id = window.setTimeout(() => {
      if (dirtyCount) writeDraft({ content: draft, baseVersion: base.version, uploads, savedAt: Date.now() });
      else writeDraft(null);
    }, 400);
    return () => window.clearTimeout(id);
  }, [draft, uploads, base, dirtyCount, restore]);

  useEffect(() => {
    if (!dirtyCount) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount]);

  // Keyboard: Ctrl/Cmd+S reviews and publishes, Ctrl/Cmd+K finds a section.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirtyCount) setReview(true);
      } else if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNavOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirtyCount]);

  // ------------------------------------------------------- deploy status
  useEffect(() => {
    if (!deploy || deploy.state === "ready" || deploy.state === "error" || deploy.state === "unknown") return;
    const id = window.setInterval(async () => {
      setNow(Date.now());
      if (Date.now() - deploy.startedAt > 8 * 60_000) {
        setDeploy((d) => (d ? { ...d, state: "unknown" } : d));
        return;
      }
      try {
        const s = await api<{ state: DeployState; url: string | null }>(`status?sha=${deploy.sha}`);
        setDeploy((d) => (d && d.sha === deploy.sha ? { ...d, state: s.state, url: s.url ?? d.url } : d));
        if (s.state === "ready") {
          toast({ tone: "ok", text: deploy.target === "live" ? "Your changes are live." : "Preview is ready." });
          if (deploy.target === "live") loadHistory();
        }
        if (s.state === "error") toast({ tone: "error", text: "The build failed. Open Vercel to see why; the previous version stays live." });
      } catch {}
    }, 4000);
    return () => window.clearInterval(id);
  }, [deploy, toast, loadHistory]);

  // ------------------------------------------------------------ uploads
  const uploadImage = useCallback(
    async (file: File) => {
      const prepared = await prepareImage(file);
      const form = new FormData();
      form.append("file", prepared.file);
      form.append("kind", "image");
      try {
        const res = await api<{ url: string; upload: StagedUpload }>("upload", { method: "POST", body: form });
        if (res.upload.blobSha) setUploads((u) => [...u.filter((x) => x.repoPath !== res.upload.repoPath), res.upload]);
        previews.current.set(res.url, URL.createObjectURL(prepared.file));
        return { url: res.url, width: prepared.width, height: prepared.height };
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  const stageCv = useCallback(
    async (file: File) => {
      if (!draft) return;
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "cv");
      form.append("cvPath", draft.profile.cvPath);
      const res = await api<{ url: string; upload: StagedUpload }>("upload", { method: "POST", body: form });
      if (res.upload.blobSha) {
        setUploads((u) => [...u.filter((x) => x.repoPath !== res.upload.repoPath), res.upload]);
        toast({ tone: "ok", text: "New CV attached. It replaces the live PDF when you publish." });
      } else toast({ tone: "ok", text: "CV replaced on this computer." });
    },
    [draft, toast]
  );

  const fieldCtx: FieldCtx = useMemo(
    () => ({ errors: errorMap, uploadImage, srcFor: (src: string) => previews.current.get(src) ?? src }),
    [errorMap, uploadImage]
  );

  // ------------------------------------------------------------ publish
  const defaultMessage = useMemo(() => {
    const titles = [...new Set(changes.map((c) => c.panel?.title).filter(Boolean))] as string[];
    if (uploads.some((u) => u.repoPath.endsWith(".pdf"))) titles.push("CV");
    if (!titles.length) return "Update site content";
    return `Update ${titles.slice(0, 3).join(", ")}${titles.length > 3 ? ` and ${titles.length - 3} more` : ""}`;
  }, [changes, uploads]);

  const publish = async (target: "live" | "preview", force = false) => {
    if (!base || !draft) return;
    setPublishing(target);
    setServerProblems([]);
    try {
      const res = await api<{ commit: string | null; version: string }>("content", {
        method: "PUT",
        body: JSON.stringify({
          content: draft,
          baseVersion: base.version,
          uploads,
          message: message.trim() || defaultMessage,
          target,
          force,
        }),
      });
      setReview(false);
      setConflict(false);
      if (target === "live") {
        setBase({ content: draft, version: res.version });
        setUploads([]);
        setMessage("");
        writeDraft(null);
      }
      if (res.commit) {
        setDeploy({ sha: res.commit, target, state: "pending", url: null, startedAt: Date.now() });
        toast({ tone: "info", text: target === "live" ? "Published. The site is rebuilding, usually about a minute." : "Building a private preview…" });
      } else {
        toast({ tone: "ok", text: "Saved to src/content/site.json. The local site reloads by itself." });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setReview(false);
        setConflict(true);
      } else if (err instanceof ApiError && err.status === 422) {
        setServerProblems((err.body.problems as Problem[]) ?? []);
        toast({ tone: "error", text: err.message });
      } else handleError(err);
    } finally {
      setPublishing(null);
    }
  };

  const loadVersion = async (entry: HistoryEntry) => {
    const res = await api<{ content: SiteContent }>(`history?ref=${entry.sha}`);
    setDraft(res.content);
    setActive("overview");
    toast({ tone: "info", text: `Loaded the version from ${timeAgo(entry.date)}. Publish to make it live again.` });
  };

  // -------------------------------------------------------------- render
  if (loadError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <WarningCircle size={28} className="mx-auto text-red-300" />
          <p className="mt-3 text-sm font-semibold text-foreground">Could not load the site content</p>
          <p className="mt-2 text-sm text-foreground-muted">{loadError}</p>
          <p className="mt-3 text-xs text-foreground-faint">
            On Vercel this usually means GITHUB_TOKEN is missing or has expired. See ADMIN.md in the repository.
          </p>
          <Btn className="mt-5" onClick={load}>
            Try again
          </Btn>
        </Card>
      </div>
    );
  }
  if (!base || !draft) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center gap-3 text-sm text-foreground-muted">
        <CircleNotch size={18} className="animate-spin" /> Loading the editor…
      </div>
    );
  }

  const panel: Panel | undefined = panels.find((p) => p.id === active);
  const tool = tools.find((t) => t.id === active);
  const q = query.trim().toLowerCase();
  const matches = (p: Panel) =>
    !q || [p.title, p.description, p.group, ...fieldLabels(p.fields)].some((s) => s.toLowerCase().includes(q));
  const groups = [...new Set(panels.map((p) => p.group))];
  const allProblems = serverProblems.length ? serverProblems : problems;

  const go = (id: string) => {
    setActive(id);
    setNavOpen(false);
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const navItem = (id: string, title: string, Icon: typeof House, extra?: { dirty?: boolean; errors?: number }) => (
    <button
      key={id}
      type="button"
      onClick={() => go(id)}
      aria-current={active === id ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[0.82rem] transition-colors",
        active === id ? "bg-surface text-foreground" : "text-foreground-muted hover:bg-surface/60 hover:text-foreground"
      )}
    >
      <Icon size={15} className={active === id ? "text-accent-strong" : "text-foreground-faint group-hover:text-foreground-muted"} />
      <span className="flex-1 truncate">{title}</span>
      {extra?.errors ? (
        <span className="rounded-full bg-red-400/20 px-1.5 text-[0.65rem] font-semibold text-red-200">{extra.errors}</span>
      ) : extra?.dirty ? (
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Unpublished changes" />
      ) : null}
    </button>
  );

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Editor sections">
      <div className="px-3 pb-3 pt-4">
        <div className="relative">
          <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a section…"
            className={cn(inputClass, "h-9 pl-8 text-[0.8rem]")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const first = panels.find(matches);
                if (first) go(first.id);
              }
              if (e.key === "Escape") setQuery("");
            }}
          />
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 pb-6">
        {!q ? <div>{navItem("overview", "Overview", House)}</div> : null}
        {groups.map((g) => {
          const items = panels.filter((p) => p.group === g && matches(p));
          if (!items.length) return null;
          return (
            <div key={g}>
              <p className="mb-1 px-2.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-foreground-faint">{g}</p>
              {items.map((p) =>
                navItem(p.id, p.title, panelIcons[p.icon], { dirty: dirtyPanels.has(p.id), errors: errorsByPanel.get(p.id) })
              )}
            </div>
          );
        })}
        {!q ? (
          <div>
            <p className="mb-1 px-2.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-foreground-faint">Tools</p>
            {tools.map((t) => navItem(t.id, t.title, t.icon, { dirty: t.id === "files" && uploads.length > 0 }))}
          </div>
        ) : null}
      </div>
      <div className="border-t border-border px-3 py-3">
        <button
          type="button"
          onClick={async () => {
            await api("logout", { method: "POST" }).catch(() => {});
            onSignedOut();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.82rem] text-foreground-muted hover:bg-surface hover:text-foreground"
        >
          <SignOut size={15} /> Sign out
        </button>
      </div>
    </nav>
  );

  const elapsed = deploy ? Math.max(0, Math.round((now - deploy.startedAt) / 1000)) : 0;
  const status = deploy && !(deploy.state === "ready" && deploy.target === "live" && dirtyCount) ? (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        deploy.state === "ready" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
        deploy.state === "error" && "border-red-400/30 bg-red-400/10 text-red-200",
        (deploy.state === "pending" || deploy.state === "building") && "border-accent/30 bg-accent-soft text-accent-strong",
        deploy.state === "unknown" && "border-border-strong text-foreground-muted"
      )}
    >
      {deploy.state === "ready" ? (
        <>
          <CheckCircle size={13} weight="fill" />
          {deploy.target === "live" ? "Live" : "Preview ready"}
          <a
            href={deploy.target === "live" ? "/" : deploy.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
          >
            Open <ArrowSquareOut size={11} />
          </a>
        </>
      ) : deploy.state === "error" ? (
        <>
          <Warning size={13} weight="fill" /> Build failed
        </>
      ) : deploy.state === "unknown" ? (
        <>Still building? Check Vercel</>
      ) : (
        <>
          <CircleNotch size={13} className="animate-spin" />
          {deploy.target === "live" ? "Publishing" : "Building preview"} · {elapsed}s
        </>
      )}
    </span>
  ) : dirtyCount ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs text-accent-strong">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {dirtyCount}
      <span className="hidden sm:inline">unpublished change{dirtyCount === 1 ? "" : "s"}</span>
      <span className="sm:hidden">unsaved</span>
    </span>
  ) : (
    <span className="hidden items-center gap-1.5 text-xs text-foreground-faint sm:inline-flex">
      <CheckCircle size={13} /> Everything published
    </span>
  );

  return (
    <FieldContext.Provider value={fieldCtx}>
      <div className="min-h-[100dvh] bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-foreground lg:hidden"
              aria-label="Open sections"
              onClick={() => setNavOpen(true)}
            >
              <List size={18} />
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-accent/30" />
              <span className="hidden text-sm font-semibold text-foreground sm:block">Site editor</span>
            </a>
            <div className="ml-1 min-w-0 flex-1 truncate">{status}</div>
            {dirtyCount ? (
              <span className="hidden sm:block">
                <Btn variant="ghost" size="sm" icon={<ArrowUUpLeft size={14} />} onClick={() => setConfirmDiscard(true)}>
                  Discard
                </Btn>
              </span>
            ) : null}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-foreground-muted hover:bg-surface hover:text-foreground sm:inline-flex"
            >
              <Eye size={14} /> View site
            </a>
            <Btn variant="primary" size="sm" icon={<CloudArrowUp size={15} />} disabled={!dirtyCount || publishing !== null} onClick={() => setReview(true)}>
              Publish
            </Btn>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          {/* Sidebar: fixed column on desktop, drawer on phones */}
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] border-r border-border bg-background-elevated/60 lg:block">{sidebar}</aside>
          {navOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setNavOpen(false)}>
              <div className="absolute inset-0 bg-black/60" />
              <aside className="absolute inset-y-0 left-0 w-[17rem] border-r border-border bg-background-elevated" onClick={(e) => e.stopPropagation()}>
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <span className="text-sm font-semibold">Sections</span>
                  <button type="button" aria-label="Close" onClick={() => setNavOpen(false)} className="text-foreground-muted">
                    <X size={18} />
                  </button>
                </div>
                <div className="h-[calc(100dvh-3.5rem)]">{sidebar}</div>
              </aside>
            </div>
          ) : null}

          <main ref={mainRef} className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-3xl">
              {restore ? (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 sm:flex-row sm:items-center">
                  <p className="flex-1 text-sm text-foreground">
                    You have unpublished edits from {timeAgo(restore.savedAt)} saved on this device.
                    {restore.baseVersion !== base.version ? (
                      <span className="mt-1 block text-xs text-amber-200">
                        The live site has changed since then. Restoring and publishing would overwrite those newer changes.
                      </span>
                    ) : null}
                  </p>
                  <div className="flex gap-2">
                    <Btn
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setDraft(restore.content as SiteContent);
                        setUploads(restore.uploads ?? []);
                        setRestore(null);
                      }}
                    >
                      Restore
                    </Btn>
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        writeDraft(null);
                        setRestore(null);
                      }}
                    >
                      Discard
                    </Btn>
                  </div>
                </div>
              ) : null}

              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground-faint">
                    {panel ? panel.group : "Editor"}
                  </p>
                  <h1 className="mt-1.5 font-display text-[1.9rem] leading-tight text-foreground">
                    {panel?.title ?? tool?.title ?? "Overview"}
                  </h1>
                  <p className="mt-1.5 max-w-xl text-sm text-foreground-muted">
                    {panel?.description ?? tool?.description ?? "Your website at a glance."}
                  </p>
                </div>
                {panel ? (
                  <a
                    href={panel.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong px-3 text-xs text-foreground-muted hover:bg-surface hover:text-foreground"
                  >
                    View on site <ArrowSquareOut size={12} />
                  </a>
                ) : null}
              </div>

              {panel ? (
                <Card>
                  <FieldList
                    key={panel.id}
                    fields={panel.fields}
                    value={(getPath(draft, panel.root) as Record<string, unknown>) ?? {}}
                    path={panel.root}
                    onChange={(v) => setDraft((d) => (d ? setPath(d, panel.root, v) : d))}
                  />
                </Card>
              ) : active === "files" ? (
                <Files
                  content={draft}
                  session={session}
                  onStageCv={stageCv}
                  uploadImage={uploadImage}
                  pendingCv={uploads.some((u) => u.repoPath === `public${draft.profile.cvPath}`)}
                />
              ) : active === "history" ? (
                <History session={session} history={history} reload={loadHistory} onLoadVersion={loadVersion} />
              ) : active === "advanced" ? (
                <Advanced key={base.version} content={draft} onReplace={setDraft} />
              ) : (
                <Overview content={draft} session={session} history={history} dirtyCount={dirtyCount} go={(id) => go(id)} />
              )}
            </div>
          </main>
        </div>

        {/* Review & publish */}
        <Modal
          open={review}
          onClose={() => setReview(false)}
          title="Review and publish"
          wide
          footer={
            <>
              <Btn variant="ghost" onClick={() => setReview(false)}>
                Keep editing
              </Btn>
              {session.mode === "github" ? (
                <Btn icon={<Eye size={15} />} disabled={allProblems.length > 0 || publishing !== null} onClick={() => publish("preview")}>
                  {publishing === "preview" ? "Building…" : "Private preview"}
                </Btn>
              ) : null}
              <Btn variant="primary" icon={<CloudArrowUp size={15} />} disabled={allProblems.length > 0 || publishing !== null} onClick={() => publish("live")}>
                {publishing === "live" ? "Publishing…" : session.mode === "github" ? "Publish to live site" : "Save to this computer"}
              </Btn>
            </>
          }
        >
          {allProblems.length ? (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-red-100">
                <WarningCircle size={16} weight="fill" /> Fix {allProblems.length} problem{allProblems.length === 1 ? "" : "s"} first
              </p>
              <ul className="mt-2 space-y-1">
                {allProblems.slice(0, 8).map((p, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="text-left text-xs text-red-200 hover:underline"
                      onClick={() => {
                        setReview(false);
                        go(p.panel);
                      }}
                    >
                      {p.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-faint">
            {changes.length} change{changes.length === 1 ? "" : "s"}
            {uploads.length ? ` · ${uploads.length} file${uploads.length === 1 ? "" : "s"}` : ""}
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {changes.slice(0, 60).map((c) => (
              <li key={c.path} className="px-4 py-3">
                <p className="text-[0.8rem] font-medium text-foreground">{c.label}</p>
                <div className="mt-1.5 grid gap-1 text-xs sm:grid-cols-2 sm:gap-3">
                  <p className="rounded-md bg-red-400/[0.07] px-2 py-1 text-red-200/80 line-through decoration-red-300/40">{preview(c.before)}</p>
                  <p className="rounded-md bg-emerald-400/[0.07] px-2 py-1 text-emerald-100">{preview(c.after)}</p>
                </div>
              </li>
            ))}
            {uploads.map((u) => (
              <li key={u.repoPath} className="px-4 py-3 text-xs text-foreground-muted">
                New file <code className="text-foreground">{u.repoPath.replace(/^public/, "")}</code>
              </li>
            ))}
            {changes.length > 60 ? <li className="px-4 py-3 text-xs text-foreground-faint">…and {changes.length - 60} more</li> : null}
          </ul>

          <label className="mt-5 block text-[0.8rem] font-medium text-foreground" htmlFor="publish-message">
            Note for the history (optional)
          </label>
          <input
            id="publish-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            className={cn(inputClass, "mt-1.5")}
          />
          {session.mode === "github" ? (
            <p className="mt-3 text-xs leading-relaxed text-foreground-faint">
              Publishing rebuilds the live site in about a minute. A private preview builds the same change on a separate
              address that only you can open while signed in to Vercel, and leaves the live site untouched.
            </p>
          ) : null}
        </Modal>

        {/* Someone (or another device) published first */}
        <Modal
          open={conflict}
          onClose={() => setConflict(false)}
          title="The site changed while you were editing"
          footer={
            <>
              <Btn
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `my-draft-${new Date().toISOString().slice(0, 16).replace(":", "")}.json`;
                  a.click();
                  setConflict(false);
                  load();
                }}
              >
                Save my draft and load the latest
              </Btn>
              <Btn variant="danger" onClick={() => publish("live", true)} disabled={publishing !== null}>
                Publish mine anyway
              </Btn>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-foreground-muted">
            Someone published a newer version since you opened the editor, perhaps from another device. You can download
            your draft as a backup and load the latest version, or publish yours and replace it.
          </p>
        </Modal>

        <Modal
          open={confirmDiscard}
          onClose={() => setConfirmDiscard(false)}
          title="Discard unpublished changes?"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setConfirmDiscard(false)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  setDraft(base.content);
                  setUploads([]);
                  writeDraft(null);
                  setConfirmDiscard(false);
                  toast({ tone: "info", text: "Draft discarded." });
                }}
              >
                Discard {dirtyCount} change{dirtyCount === 1 ? "" : "s"}
              </Btn>
            </>
          }
        >
          <p className="text-sm text-foreground-muted">The editor goes back to what is live now. This cannot be undone.</p>
        </Modal>
      </div>
    </FieldContext.Provider>
  );
}
