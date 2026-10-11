"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleNotch, Eye, EyeSlash, LockKey, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { api, ApiError, type Session } from "./lib";
import { Editor } from "./Editor";
import { Btn, inputClass, ToastProvider } from "./ui";

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    api<Session>("session").then(
      (s) => {
        setSession(s);
        setFailed(false);
      },
      () => setFailed(true)
    );
  }, []);

  useEffect(() => {
    let live = true;
    api<Session>("session").then(
      (s) => live && setSession(s),
      () => live && setFailed(true)
    );
    return () => {
      live = false;
    };
  }, []);

  let body;
  if (failed) body = <Centered>Could not reach the editor service. Check your connection and reload.</Centered>;
  else if (!session)
    body = (
      <Centered>
        <CircleNotch size={18} className="animate-spin" />
      </Centered>
    );
  else if (!session.hasPassword || session.mode === "unconfigured") body = <SetupNeeded session={session} />;
  else if (!session.authed) body = <Login onDone={refresh} />;
  else body = <Editor session={session} onSignedOut={refresh} />;

  return <ToastProvider>{body}</ToastProvider>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[100dvh] items-center justify-center gap-3 p-6 text-sm text-foreground-muted">{children}</div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 10%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(50% 50% at 10% 100%, rgba(139,125,255,0.12), transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        {children}
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground-faint hover:text-foreground">
          <ArrowLeft size={12} /> Back to the website
        </Link>
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await api("login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <form onSubmit={submit} className="rounded-2xl border border-border-strong bg-background-elevated/90 p-7 shadow-2xl backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-accent/30" />
        <h1 className="mt-5 font-display text-2xl text-foreground">Site editor</h1>
        <p className="mt-1.5 text-sm text-foreground-muted">Sign in to update your website.</p>

        <label htmlFor="admin-password" className="mt-6 block text-[0.8rem] font-medium text-foreground">
          Password
        </label>
        <div className="relative mt-1.5">
          <LockKey size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(inputClass, "h-11 pl-9 pr-10", error && "border-red-400/60")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-foreground-faint hover:text-foreground"
          >
            {show ? <EyeSlash size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-300" role="alert">
            <WarningCircle size={13} weight="fill" /> {error}
          </p>
        ) : null}
        <Btn type="submit" variant="primary" className="mt-5 w-full" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Btn>
      </form>
    </Shell>
  );
}

function SetupNeeded({ session }: { session: Session }) {
  return (
    <Shell>
      <div className="rounded-2xl border border-border-strong bg-background-elevated/90 p-7 shadow-2xl">
        <h1 className="font-display text-2xl text-foreground">Editor not set up yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {!session.hasPassword
            ? "No admin password has been configured for this deployment."
            : "The editor has a password but no GitHub connection, so it cannot publish."}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          Follow ADMIN.md in the repository: add <code className="text-foreground">ADMIN_PASSWORD_HASH</code> and{" "}
          <code className="text-foreground">GITHUB_TOKEN</code> under Vercel → Settings → Environment Variables, then
          redeploy.
        </p>
      </div>
    </Shell>
  );
}
