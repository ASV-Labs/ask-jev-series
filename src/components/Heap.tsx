"use client";

import { CATALOG, SERIES } from "@/data/series";
import { HeapPhysics } from "@/lib/physics";
import { FILTER_OPTIONS, SERVICE_ORDER, SERVICES } from "@/lib/services";
import type { Series, ServiceId } from "@/lib/types";
import { ChevronDown, ChevronsUpDown, CornerDownLeft, LoaderCircle, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButlerMark } from "./ButlerMark";

const RADIUS = 17;
const POSTER_CELL = { width: 128, height: 192 };
const SUGGEST_COLORS = [
  "text-sky-500/70 hover:text-sky-500",
  "text-emerald-500/70 hover:text-emerald-500",
  "text-violet-500/70 hover:text-violet-500",
  "text-amber-500/80 hover:text-amber-500",
  "text-rose-500/70 hover:text-rose-500",
];

const cache = new Map<string, Map<string, number>>();

function hueFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 360;
}

function PosterFace({ item }: { item: Series }) {
  const service = SERVICES[item.group];
  const hue = hueFromId(item.id);
  return (
    <div
      className="token-poster"
      style={{
        background: `linear-gradient(160deg, ${service.color} 0%, hsl(${hue} 42% 22%) 100%)`,
        color: service.ink,
      }}
    >
      <span className="token-poster-service">{service.label}</span>
      <span className="token-poster-glyph">{item.glyph}</span>
      <span className="token-poster-title">{item.name}</span>
    </div>
  );
}

export function Heap() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [verdicts, setVerdicts] = useState<Map<string, number> | null>(null);
  const [answeredQuery, setAnsweredQuery] = useState("");
  const [missing, setMissing] = useState(0);
  const [source, setSource] = useState("");
  const [group, setGroup] = useState("all");
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const [suggestTick, setSuggestTick] = useState(0);
  const [exampleTick, setExampleTick] = useState(0);
  const readyAt = useRef(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const engineRef = useRef<HeapPhysics | null>(null);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const frameRef = useRef(0);

  const items = useMemo(
    () => (group === "all" ? SERIES : SERIES.filter((item) => item.group === group)),
    [group],
  );

  const layout = useMemo(() => {
    const perRow = Math.max(1, Math.floor(Math.min(size.width - 64, 1120) / POSTER_CELL.width));
    const top = Math.max(235, 0.3 * size.height);
    const rows = Math.max(1, Math.floor((size.height - 210 - top) / POSTER_CELL.height));
    return { cell: POSTER_CELL, perRow, top, capacity: perRow * rows };
  }, [size]);

  const risen = useMemo(() => {
    if (!verdicts) return [];
    return items
      .map((item) => ({ item, probability: verdicts.get(item.id) ?? 0 }))
      .filter((row) => row.probability >= 0.5)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, layout.capacity);
  }, [items, verdicts, layout]);

  const risenIds = useMemo(() => new Set(risen.map((row) => row.item.id)), [risen]);
  const matchCount = useMemo(
    () => (verdicts ? items.filter((item) => (verdicts.get(item.id) ?? 0) >= 0.5).length : 0),
    [items, verdicts],
  );

  const refinement = useMemo(() => {
    if (status !== "ready" || !query.trim()) return "";
    const lower = query.toLowerCase();
    const options = CATALOG.refinements.filter((hint) => {
      const core = hint.toLowerCase().replace(/^(and|without|somewhere|that)\s+/, "");
      return !lower.includes(core);
    });
    if (!options.length) return "";
    const index = ((suggestTick % options.length) + options.length) % options.length;
    return options[index];
  }, [status, query, suggestTick]);

  const example = useMemo(
    () => (query || status === "thinking" ? "" : CATALOG.examples[exampleTick % CATALOG.examples.length]),
    [query, status, exampleTick],
  );

  const suggestColor = SUGGEST_COLORS[(suggestTick % SUGGEST_COLORS.length + SUGGEST_COLORS.length) % SUGGEST_COLORS.length];

  const bindNode = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  const applyTargets = useCallback(() => {
    const root = rootRef.current;
    const engine = engineRef.current;
    if (!root || !engine) return;
    const targets = new Map<string, { x: number; y: number }>();
    if (risen.length) {
      const width = root.clientWidth;
      const { cell, perRow, top } = layout;
      risen.forEach(({ item }, index) => {
        const row = Math.floor(index / perRow);
        const inRow = Math.min(perRow, risen.length - row * perRow);
        const origin = (width - inRow * cell.width) / 2 + cell.width / 2;
        targets.set(item.id, {
          x: origin + (index % perRow) * cell.width,
          y: top + row * cell.height,
        });
      });
    }
    engine.setTargets(targets, performance.now());
  }, [risen, layout]);

  const physicsKey = `${group}:${items.length}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ids = (group === "all" ? SERIES : SERIES.filter((item) => item.group === group)).map((item) => item.id);
    const engine = new HeapPhysics(RADIUS);
    engineRef.current = engine;
    engine.setBounds(root.clientWidth, root.clientHeight, 44, ids.length);
    engine.seed(ids);
    setSize({ width: root.clientWidth, height: root.clientHeight });
    const tick = (now: number) => {
      engine.step(now);
      for (const body of engine.bodies) {
        const node = nodes.current.get(body.id);
        if (!node) continue;
        node.style.transform = `translate3d(${Math.round(body.x)}px, ${Math.round(body.y)}px, 0) translate(-50%, -50%)`;
        node.style.setProperty("--arrived", body.target && body.phase === "seeking" ? "1" : "0");
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    const onResize = () => {
      engine.setBounds(root.clientWidth, root.clientHeight, 44, ids.length);
      setSize({ width: root.clientWidth, height: root.clientHeight });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [physicsKey, group]);

  useEffect(() => {
    applyTargets();
  }, [applyTargets]);

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      abortRef.current?.abort();
      if (trimmed.length < 3) {
        setVerdicts(null);
        setStatus("idle");
        setError("");
        setSource("");
        return;
      }
      const key = `${group}::${trimmed.toLowerCase().replace(/\s+/g, " ")}`;
      const hit = cache.get(key);
      if (hit) {
        setVerdicts(hit);
        setMissing(0);
        setAnsweredQuery(trimmed);
        readyAt.current = Date.now();
        setStatus("ready");
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("thinking");
      setError("");
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: trimmed, group }),
          signal: controller.signal,
        });
        const payload = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setStatus("error");
          setError(payload?.error ?? "Jev could not answer that one.");
          return;
        }
        const next = new Map<string, number>();
        for (const row of payload.verdicts as { id: string; probability: number }[]) {
          next.set(row.id, row.probability);
        }
        if (!payload.missing?.length) cache.set(key, next);
        setVerdicts(next);
        setMissing(payload.missing?.length ?? 0);
        setSource(payload.source ?? "");
        setAnsweredQuery(trimmed);
        readyAt.current = Date.now();
        setStatus("ready");
      } catch (caught) {
        if ((caught as { name?: string }).name === "AbortError") return;
        setStatus("error");
        setError("Could not reach Jev. Check your connection and try again.");
      }
    },
    [group],
  );

  useEffect(() => {
    const timer = setTimeout(() => void ask(query), 450);
    return () => clearTimeout(timer);
  }, [query, ask]);

  useEffect(() => {
    if (query) return;
    const timer = setInterval(() => setExampleTick((n) => n + 1), 2800);
    return () => clearInterval(timer);
  }, [query]);

  useEffect(() => {
    if (status !== "ready") return;
    const timer = setTimeout(() => setSuggestTick((n) => n + 1), 3400);
    return () => clearTimeout(timer);
  }, [status, suggestTick]);

  const clearAnswers = () => {
    setVerdicts(null);
    setStatus("idle");
    setError("");
    setSource("");
  };

  const addRefinement = () => {
    if (!refinement) return;
    setQuery((current) => `${current.trim()} ${refinement}`.trim());
    setSuggestTick(0);
    inputRef.current?.focus();
  };

  const reset = () => {
    abortRef.current?.abort();
    nodes.current.clear();
    setQuery("");
    clearAnswers();
  };

  const footerSource =
    source === "heuristic"
      ? "local heuristic · add a TypeSafe key for live Jev"
      : source === "gateway"
        ? "TypeSafe Jev via Vercel AI Gateway"
        : "TypeSafe Jev";

  return (
    <main
      ref={rootRef}
      className="relative h-dvh w-full overflow-hidden"
      style={{ ["--token-size" as string]: `${2 * RADIUS}px` }}
    >
      <div className="absolute inset-0">
        {items.map((item) => {
          const probability = verdicts?.get(item.id) ?? 0;
          const isUp = risenIds.has(item.id);
          return (
            <div
              key={item.id}
              ref={(node) => bindNode(item.id, node)}
              className="token"
              data-risen={isUp}
              data-shape="poster"
              style={{ opacity: verdicts && !isUp ? 0.4 : 1 }}
              title={isUp ? `${item.name} — Jev is ${Math.round(100 * probability)}% sure` : item.name}
            >
              <span className="token-glyph">
                <PosterFace item={item} />
              </span>
              <span className="token-label" style={{ maxWidth: layout.cell.width - 14 }}>
                <span className="line-clamp-2 block text-[11px] leading-tight font-medium text-ink">{item.name}</span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted">{item.meta}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none relative z-30 flex h-full flex-col">
        <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <ButlerMark className="size-9 shrink-0" />
            <span className="wordmark text-[23px] leading-none whitespace-nowrap">Ask Jevs</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <label className="relative flex items-center">
              <span className="sr-only">Service</span>
              <select
                value={group}
                onChange={(event) => {
                  abortRef.current?.abort();
                  nodes.current.clear();
                  setGroup(event.target.value);
                  clearAnswers();
                }}
                className="appearance-none rounded-full border border-line bg-surface/80 py-1.5 pr-7 pl-3 text-xs font-medium text-ink backdrop-blur outline-none hover:border-accent focus:border-accent"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted" />
            </label>
            <nav className="tab-scroll flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-surface/80 p-1 backdrop-blur">
              <button
                onClick={() => {
                  abortRef.current?.abort();
                  nodes.current.clear();
                  setGroup("all");
                  setQuery("");
                  clearAnswers();
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  group === "all" ? "bg-accent text-white" : "text-muted hover:text-ink"
                }`}
              >
                All
              </button>
              {SERVICE_ORDER.map((id: ServiceId) => (
                <button
                  key={id}
                  onClick={() => {
                    abortRef.current?.abort();
                    nodes.current.clear();
                    setGroup(id);
                    setQuery("");
                    clearAnswers();
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    group === id ? "bg-accent text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {SERVICES[id].label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="pointer-events-none flex flex-col items-center px-5">
          <div className="pointer-events-auto w-full max-w-2xl">
            <p className="mb-3 text-center text-[13px] text-muted">{CATALOG.tagline}</p>
            <div className="relative rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-24px_oklch(0_0_0/0.45)] focus-within:border-accent">
              <Search className="absolute top-1/2 left-5 size-[18px] -translate-y-1/2 text-muted" />
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center overflow-hidden pr-14 pl-13 text-[17px] whitespace-pre">
                <span aria-hidden className="invisible">
                  {query}
                </span>
                {example ? (
                  <button
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(example);
                      inputRef.current?.focus();
                    }}
                    tabIndex={-1}
                    className="animate-example pointer-events-auto text-left text-ink/35 transition-colors hover:text-ink/70"
                    title="Ask this"
                  >
                    {example}
                  </button>
                ) : null}
                {refinement ? (
                  <>
                    <button
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setSuggestTick((n) => n + 1)}
                      tabIndex={-1}
                      className={`animate-example pointer-events-auto transition-colors ${suggestColor}`}
                      title="Click for the next one, Tab or Enter to add it"
                    >
                      {" "}
                      {refinement}
                    </button>
                    <button
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setSuggestTick((n) => n + 1)}
                      aria-label="Another suggestion"
                      title="Show another"
                      className="pointer-events-auto ml-1.5 grid size-7 shrink-0 place-items-center rounded-md text-muted/50 transition-colors hover:bg-line hover:text-ink"
                    >
                      <ChevronsUpDown className="size-4" />
                    </button>
                  </>
                ) : null}
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSuggestTick(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Tab" && refinement) {
                    event.preventDefault();
                    addRefinement();
                    return;
                  }
                  if (event.key === "ArrowRight" && refinement) {
                    const target = event.currentTarget;
                    if (target.selectionStart === target.value.length && target.selectionStart === target.selectionEnd) {
                      event.preventDefault();
                      addRefinement();
                      return;
                    }
                  }
                  if (refinement && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                    event.preventDefault();
                    setSuggestTick((n) => n + (event.key === "ArrowDown" ? 1 : -1));
                    return;
                  }
                  if (event.key === " " && refinement && Date.now() - readyAt.current > 900) {
                    const target = event.currentTarget;
                    if (
                      target.selectionStart === target.value.length &&
                      target.selectionStart === target.selectionEnd &&
                      !target.value.endsWith(" ")
                    ) {
                      event.preventDefault();
                      addRefinement();
                      return;
                    }
                  }
                  if (event.key === "Enter") {
                    if (refinement) addRefinement();
                    else void ask(query);
                  } else if (event.key === "Escape") {
                    setQuery("");
                    clearAnswers();
                  }
                }}
                maxLength={160}
                aria-label="Ask about television series"
                className="relative z-10 h-16 w-full bg-transparent pr-14 pl-13 text-[17px] outline-none placeholder:text-muted/70"
              />
              <div className="absolute top-1/2 right-4 z-30 flex -translate-y-1/2 items-center gap-1">
                {status === "thinking" ? (
                  <LoaderCircle className="size-[18px] animate-spin text-accent" />
                ) : query ? (
                  <button
                    onClick={reset}
                    aria-label="Clear"
                    className="grid size-7 place-items-center rounded-full text-muted hover:bg-line hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <CornerDownLeft className="size-4 text-muted/50" />
                )}
              </div>
            </div>
            <div className="mt-4 min-h-14 text-center">
              {status === "error" ? (
                <p className="text-[12px]">
                  <span className="text-red-500">{error}</span>
                  {verdicts && answeredQuery ? (
                    <span className="text-muted"> Still showing “{answeredQuery}”.</span>
                  ) : null}
                </p>
              ) : null}
              {status === "ready" && matchCount === 0 ? (
                <p className="animate-rise-in text-[12px] text-muted">Nothing here fits that. Try loosening it.</p>
              ) : null}
              {status === "ready" && matchCount > 0 && missing > 0 ? (
                <p className="animate-rise-in text-[12px] text-amber-600">{missing} could not be reached this time.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between px-5 pb-3 text-[10px] text-muted/70 sm:px-8">
          <span>
            {items.length} television series · every one considered on every question
          </span>
          <span className="hidden sm:inline">{footerSource}</span>
        </div>
      </div>
    </main>
  );
}
