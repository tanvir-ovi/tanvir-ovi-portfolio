"use client";

import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  CaretDown,
  Copy,
  Crosshair,
  Eye,
  EyeSlash,
  ImageSquare,
  MagicWand,
  Plus,
  Trash,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { HOME_SECTIONS, joinPath, slugify, type Field } from "@/lib/admin-schema";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { Btn, FieldShell, IconBtn, inputClass, Toggle, useToast } from "./ui";

// ------------------------------------------------------------------ context

export interface FieldCtx {
  errors: Map<string, string>;
  uploadImage: (file: File) => Promise<{ url: string; width: number; height: number }>;
  srcFor: (src: string) => string;
}

export const FieldContext = createContext<FieldCtx>({
  errors: new Map(),
  uploadImage: async () => {
    throw new Error("Uploads are not available");
  },
  srcFor: (s) => s,
});

const useFields = () => useContext(FieldContext);

/** True when any error sits at or below `path`. */
function hasErrorUnder(errors: Map<string, string>, path: string) {
  for (const key of errors.keys()) if (key === path || key.startsWith(path + ".")) return true;
  return false;
}

// ----------------------------------------------------------------- renderer

export function FieldList({
  fields,
  value,
  path,
  onChange,
}: {
  fields: Field[];
  value: Record<string, unknown>;
  path: string;
  onChange: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key || field.type}
          field={field}
          value={field.key ? value?.[field.key] : value}
          siblings={value}
          path={joinPath(path, field.key)}
          onChange={(v) => onChange(withAutoFields(fields, value, field.key, v))}
        />
      ))}
    </div>
  );
}

/* Applies one field's new value. Fields with `autoFrom` (anchor ids) follow
 * their source while they are empty or still equal to the generated value,
 * so a new paper gets an id from its title but an existing id never moves. */
function withAutoFields(fields: Field[], value: Record<string, unknown>, key: string, v: unknown) {
  if (!key) return v as Record<string, unknown>;
  let next: Record<string, unknown> = { ...value, [key]: v };
  for (const f of fields) {
    if (f.type !== "text" || f.autoFrom !== key) continue;
    const current = String(value?.[f.key] ?? "");
    if (!current || current === slugify(String(value?.[key] ?? ""))) {
      next = { ...next, [f.key]: slugify(String(v ?? "")) };
    }
  }
  return next;
}

export function FieldRenderer({
  field,
  value,
  siblings,
  path,
  onChange,
}: {
  field: Field;
  value: unknown;
  siblings?: Record<string, unknown>;
  path: string;
  onChange: (v: unknown) => void;
}) {
  const { errors } = useFields();
  const id = useId();
  const error = errors.get(path)?.replace(/^[^:]+: /, "");
  const label = field.label + ("required" in field && field.required ? " *" : "");

  switch (field.type) {
    case "text": {
      const v = typeof value === "string" ? value : "";
      const source = field.autoFrom ? String(siblings?.[field.autoFrom] ?? "") : "";
      return (
        <FieldShell
          label={label}
          help={field.help}
          error={error}
          htmlFor={id}
          aside={
            field.format === "url" && /^https?:\/\//.test(v) ? (
              <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
                Open <ArrowSquareOut size={12} />
              </a>
            ) : field.autoFrom && source && slugify(source) !== v ? (
              <button type="button" onClick={() => onChange(slugify(source))} className="inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
                <MagicWand size={12} /> Fill from {field.autoFrom}
              </button>
            ) : null
          }
        >
          <input
            id={id}
            type="text"
            value={v}
            placeholder={field.placeholder}
            spellCheck={field.format ? false : undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (field.autoFrom && !v && source) onChange(slugify(source));
            }}
            className={cn(inputClass, field.format && "font-mono text-[0.8rem]", error && "border-red-400/60")}
          />
        </FieldShell>
      );
    }
    case "textarea": {
      const v = typeof value === "string" ? value : "";
      return (
        <FieldShell
          label={label}
          help={field.help}
          error={error}
          htmlFor={id}
          aside={<span className="text-[0.7rem] tabular-nums text-foreground-faint">{v.length} chars</span>}
        >
          <AutoTextarea id={id} value={v} rows={field.rows ?? 3} onChange={onChange} invalid={Boolean(error)} />
        </FieldShell>
      );
    }
    case "toggle":
      return (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/40 px-4 py-3">
          <div>
            <label htmlFor={id} className="text-[0.8rem] font-medium text-foreground">
              {field.label}
            </label>
            {field.help ? <p className="mt-0.5 text-xs text-foreground-faint">{field.help}</p> : null}
          </div>
          <Toggle id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
        </div>
      );
    case "select":
      return (
        <FieldShell label={label} help={field.help} error={error} htmlFor={id}>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={field.label}>
            {field.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(o.value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  value === o.value
                    ? "border-accent/60 bg-accent-soft text-accent-strong"
                    : "border-border-strong text-foreground-muted hover:text-foreground"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FieldShell>
      );
    case "tags":
      return (
        <FieldShell label={label} help={field.help ?? "Press Enter or comma to add. Click × to remove."} error={error}>
          <TagsInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
        </FieldShell>
      );
    case "paragraphs":
      return (
        <ParagraphsInput
          field={field}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          error={error}
        />
      );
    case "image":
      return <ImageInput field={field} value={value as ImageRef} path={path} onChange={onChange} />;
    case "object":
      return (
        <fieldset className="rounded-xl border border-border bg-background/30 p-4 sm:p-5">
          <legend className="px-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">{field.label}</legend>
          {field.help ? <p className="-mt-1 mb-4 text-xs text-foreground-faint">{field.help}</p> : null}
          <FieldList
            fields={field.fields}
            value={(value as Record<string, unknown>) ?? {}}
            path={path}
            onChange={onChange}
          />
        </fieldset>
      );
    case "list":
      return <ListInput field={field} value={Array.isArray(value) ? value : []} path={path} onChange={onChange} error={error} />;
    case "sections":
      return <SectionsInput value={Array.isArray(value) ? (value as { id: string; visible: boolean }[]) : []} onChange={onChange} help={field.help} />;
  }
}

// ---------------------------------------------------------------- textarea

function AutoTextarea({
  id,
  value,
  rows,
  onChange,
  invalid,
  placeholder,
}: {
  id?: string;
  value: string;
  rows: number;
  onChange: (v: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "resize-y leading-relaxed [field-sizing:content] min-h-[4.5rem]", invalid && "border-red-400/60")}
      style={{ minHeight: `${Math.max(2, rows) * 1.55 + 1.2}rem` }}
    />
  );
}

// -------------------------------------------------------------------- tags

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const commit = (text: string) => {
    const items = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !value.includes(t));
    if (items.length) onChange([...value, ...items]);
    setDraft("");
  };
  return (
    <div className={cn(inputClass, "flex min-h-[2.6rem] flex-wrap items-center gap-1.5 py-1.5")}>
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface py-0.5 pl-2 pr-1 text-xs text-foreground">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="rounded p-0.5 text-foreground-faint hover:bg-surface-hover hover:text-foreground"
          >
            <X size={11} weight="bold" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => {
          if (e.target.value.includes(",")) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft && commit(draft)}
        placeholder={value.length ? "" : "Type and press Enter"}
        className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-foreground-faint"
      />
    </div>
  );
}

// -------------------------------------------------------------- paragraphs

function ParagraphsInput({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<Field, { type: "paragraphs" }>;
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <FieldShell label={field.label} help={field.help} error={error}>
      <div className="space-y-2.5">
        {value.map((text, i) => (
          <div key={i} className="group flex gap-2">
            <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[0.7rem] text-foreground-faint">{i + 1}</span>
            <div className="flex-1">
              <AutoTextarea value={text} rows={field.rows ?? 3} onChange={(v) => onChange(value.map((t, j) => (j === i ? v : t)))} />
            </div>
            <div className="flex flex-col gap-0.5 pt-1 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={14} />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={14} />
              </IconBtn>
              <IconBtn label={`Delete ${field.itemLabel.toLowerCase()}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-red-300">
                <Trash size={14} />
              </IconBtn>
            </div>
          </div>
        ))}
        <Btn size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => onChange([...value, ""])}>
          Add {field.itemLabel.toLowerCase()}
        </Btn>
      </div>
    </FieldShell>
  );
}

// -------------------------------------------------------------------- list

function ListInput({
  field,
  value,
  path,
  onChange,
  error,
}: {
  field: Extract<Field, { type: "list" }>;
  value: unknown[];
  path: string;
  onChange: (v: unknown[]) => void;
  error?: string;
}) {
  const { errors } = useFields();
  const toast = useToast();
  const [open, setOpen] = useState<boolean[]>(() => value.map(() => false));
  const listRef = useRef<HTMLDivElement>(null);
  const isOpen = (i: number) => open[i] ?? false;
  const full = field.max !== undefined && value.length >= field.max;

  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    const o = value.map((_, j) => isOpen(j));
    [o[i], o[i + d]] = [o[i + d], o[i]];
    setOpen(o);
    onChange(next);
  };
  const remove = (i: number) => {
    const before = value;
    const beforeOpen = value.map((_, j) => isOpen(j));
    onChange(value.filter((_, j) => j !== i));
    setOpen(beforeOpen.filter((_, j) => j !== i));
    toast({
      tone: "info",
      text: `${field.itemLabel} deleted.`,
      action: {
        label: "Undo",
        run: () => {
          onChange(before);
          setOpen(beforeOpen);
        },
      },
    });
  };
  const duplicate = (i: number) => {
    const copy = JSON.parse(JSON.stringify(value[i])) as Record<string, unknown>;
    if (typeof copy.id === "string" && copy.id) copy.id = `${copy.id}-copy`;
    const next = [...value.slice(0, i + 1), copy, ...value.slice(i + 1)];
    const o = value.map((_, j) => isOpen(j));
    o.splice(i + 1, 0, true);
    setOpen(o);
    onChange(next);
  };
  const add = () => {
    const item = JSON.parse(JSON.stringify(field.newItem));
    // News reads newest first, so new entries go on top.
    const top = field.key === "items" && path.endsWith("news.items");
    onChange(top ? [item, ...value] : [...value, item]);
    const o = value.map((_, j) => isOpen(j));
    setOpen(top ? [true, ...o] : [...o, true]);
    requestAnimationFrame(() => {
      const cards = listRef.current?.querySelectorAll("[data-list-item]");
      const el = cards?.[top ? 0 : cards.length - 1] as HTMLElement | undefined;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.8rem] font-medium text-foreground">
          {field.label}
          <span className="ml-2 font-normal text-foreground-faint">
            {value.length}
            {field.max ? ` / ${field.max}` : ""}
          </span>
        </p>
        {value.length > 1 ? (
          <button
            type="button"
            className="text-xs text-foreground-faint hover:text-foreground"
            onClick={() => setOpen(value.map(() => !open.some(Boolean)))}
          >
            {open.some(Boolean) ? "Collapse all" : "Expand all"}
          </button>
        ) : null}
      </div>
      {field.help ? <p className="-mt-1 text-xs text-foreground-faint">{field.help}</p> : null}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <WarningCircle size={13} weight="fill" /> {error}
        </p>
      ) : null}

      <div ref={listRef} className="space-y-2">
        {value.map((item, i) => {
          const itemPath = joinPath(path, i);
          const rec = (item ?? {}) as Record<string, unknown>;
          const title = field.titleKey ? String(rec[field.titleKey] ?? "").trim() : "";
          const subtitle = field.subtitleKey ? String(rec[field.subtitleKey] ?? "").trim() : "";
          const bad = hasErrorUnder(errors, itemPath);
          return (
            <div
              key={i}
              data-list-item
              className={cn(
                "rounded-xl border bg-background/40 transition-colors",
                bad ? "border-red-400/40" : isOpen(i) ? "border-border-strong" : "border-border hover:border-border-strong"
              )}
            >
              <div className="flex items-center gap-1 pl-3 pr-1.5">
                <button
                  type="button"
                  aria-expanded={isOpen(i)}
                  onClick={() => setOpen(value.map((_, j) => (j === i ? !isOpen(j) : isOpen(j))))}
                  className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
                >
                  <CaretDown size={13} className={cn("shrink-0 text-foreground-faint transition-transform", !isOpen(i) && "-rotate-90")} />
                  {typeof rec.src === "string" && rec.src ? <Thumb src={rec.src} /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {title || <span className="italic text-foreground-faint">New {field.itemLabel.toLowerCase()}</span>}
                    </span>
                    {subtitle ? <span className="block truncate text-xs text-foreground-faint">{subtitle}</span> : null}
                  </span>
                  {bad ? <WarningCircle size={15} weight="fill" className="shrink-0 text-red-300" /> : null}
                </button>
                <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={14} />
                </IconBtn>
                <IconBtn label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown size={14} />
                </IconBtn>
                <IconBtn label="Duplicate" disabled={full} onClick={() => duplicate(i)}>
                  <Copy size={14} />
                </IconBtn>
                <IconBtn label={`Delete ${field.itemLabel.toLowerCase()}`} onClick={() => remove(i)} className="hover:text-red-300">
                  <Trash size={14} />
                </IconBtn>
              </div>
              {isOpen(i) ? (
                <div className="border-t border-border px-4 py-5 sm:px-5">
                  <FieldList fields={field.fields} value={rec} path={itemPath} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <Btn size="sm" variant="secondary" icon={<Plus size={14} />} onClick={add} disabled={full}>
        Add {field.itemLabel.toLowerCase()}
      </Btn>
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  const { srcFor } = useFields();
  const [broken, setBroken] = useState(false);
  return broken ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-faint">
      <ImageSquare size={14} />
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={srcFor(src)} alt="" onError={() => setBroken(true)} className="h-8 w-8 shrink-0 rounded-md border border-border object-cover" />
  );
}

// ------------------------------------------------------------------- image

function ImageInput({
  field,
  value,
  path,
  onChange,
}: {
  field: Extract<Field, { type: "image" }>;
  value: ImageRef | undefined;
  path: string;
  onChange: (v: ImageRef) => void;
}) {
  const { errors, uploadImage, srcFor } = useFields();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [broken, setBroken] = useState<string | null>(null);
  const img: ImageRef = value ?? { src: "", width: 0, height: 0, alt: "" };
  const error = errors.get(path)?.replace(/^[^:]+: /, "");
  const set = (patch: Partial<ImageRef>) => onChange({ ...img, ...patch });

  const [fx, fy] = (img.focus || "50% 50%").split(" ").map((v) => parseFloat(v));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadImage(file);
      setBroken(null);
      set({ src: res.url, width: res.width, height: res.height });
      toast({ tone: "ok", text: "Picture uploaded. It goes live when you publish." });
    } catch (err) {
      toast({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <FieldShell label={field.label} help={field.help} error={error}>
      <div
        className="grid gap-4 rounded-xl border border-border bg-background/40 p-3 sm:grid-cols-[11rem_1fr]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="space-y-2">
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-lg border border-border",
              "bg-[conic-gradient(#0b1424_25%,#070d1a_0_50%,#0b1424_0_75%,#070d1a_0)] bg-[length:16px_16px]",
              field.focus && img.src && "cursor-crosshair"
            )}
            onClick={(e) => {
              if (!field.focus || !img.src) return;
              const r = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - r.left) / r.width) * 100);
              const y = Math.round(((e.clientY - r.top) / r.height) * 100);
              set({ focus: `${x}% ${y}%` });
            }}
          >
            {img.src && broken !== img.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={srcFor(img.src)}
                alt=""
                onError={() => setBroken(img.src)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center text-[0.7rem] text-foreground-faint">
                <ImageSquare size={22} />
                {img.src ? "Shows after publishing" : "No picture yet"}
              </div>
            )}
            {field.focus && img.src ? (
              <span
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
                style={{ left: `${fx || 50}%`, top: `${Number.isNaN(fy) ? 50 : fy}%` }}
                aria-hidden="true"
              />
            ) : null}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <Btn size="sm" variant="secondary" className="w-full" icon={<UploadSimple size={14} />} disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "Uploading…" : img.src ? "Replace picture" : "Upload picture"}
          </Btn>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-foreground-muted">Description (alt text)</label>
            <AutoTextarea value={img.alt ?? ""} rows={2} onChange={(alt) => set({ alt })} placeholder="What the picture shows, for screen readers and Google" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-foreground-muted">Picture address</label>
            <input value={img.src} onChange={(e) => set({ src: e.target.value })} spellCheck={false} className={cn(inputClass, "font-mono text-[0.75rem]")} placeholder="/images/photo.webp" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-faint">
            <span className="inline-flex items-center gap-1.5">
              Size
              <input
                type="number"
                min={1}
                value={img.width || ""}
                onChange={(e) => set({ width: Number(e.target.value) })}
                className={cn(inputClass, "h-7 w-20 px-2 py-0 text-xs")}
                aria-label="Width in pixels"
              />
              ×
              <input
                type="number"
                min={1}
                value={img.height || ""}
                onChange={(e) => set({ height: Number(e.target.value) })}
                className={cn(inputClass, "h-7 w-20 px-2 py-0 text-xs")}
                aria-label="Height in pixels"
              />
              px
            </span>
            {field.focus ? (
              <span className="inline-flex items-center gap-1.5">
                <Crosshair size={13} />
                {img.focus ? (
                  <>
                    Focus {img.focus}
                    <button type="button" className="text-accent-strong hover:underline" onClick={() => set({ focus: "" })}>
                      reset
                    </button>
                  </>
                ) : (
                  "Click the picture to set the focus point"
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </FieldShell>
  );
}

// ---------------------------------------------------------------- sections

function SectionsInput({
  value,
  onChange,
  help,
}: {
  value: { id: string; visible: boolean }[];
  onChange: (v: { id: string; visible: boolean }[]) => void;
  help?: string;
}) {
  const labels = new Map(HOME_SECTIONS.map((s) => [s.id, s.label]));
  // Sections added to the site after this content was saved show up as hidden.
  const missing = HOME_SECTIONS.filter((s) => !value.some((v) => v.id === s.id));
  const rows = [...value, ...missing.map((s) => ({ id: s.id, visible: false }))];
  const move = (i: number, d: number) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {help ? <p className="text-xs text-foreground-faint">{help}</p> : null}
      <ol className="space-y-2">
        <li className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-foreground-faint">
          <span className="w-5 text-right font-mono text-[0.7rem]">0</span>
          Hero (always first)
        </li>
        {rows.map((s, i) => (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
              s.visible ? "border-border-strong bg-background/40" : "border-border bg-transparent"
            )}
          >
            <span className="w-5 text-right font-mono text-[0.7rem] text-foreground-faint">{i + 1}</span>
            <span className={cn("flex-1 text-sm", s.visible ? "text-foreground" : "text-foreground-faint line-through")}>
              {labels.get(s.id) ?? s.id}
            </span>
            <span className="hidden text-xs text-foreground-faint sm:inline">
              {s.visible ? <Eye size={14} className="inline" /> : <EyeSlash size={14} className="inline" />}
            </span>
            <Toggle
              checked={s.visible}
              label={`Show ${labels.get(s.id) ?? s.id}`}
              onChange={(visible) => onChange(rows.map((r, j) => (j === i ? { ...r, visible } : r)))}
            />
            <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp size={14} />
            </IconBtn>
            <IconBtn label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown size={14} />
            </IconBtn>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-accent/20 bg-accent-soft px-4 py-3 text-xs leading-relaxed text-foreground-muted">{children}</p>;
}
