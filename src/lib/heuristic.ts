import { SERVICES } from "./services";
import type { Series } from "./types";

const STOP = new Set([
  "a",
  "an",
  "and",
  "the",
  "to",
  "for",
  "of",
  "on",
  "in",
  "it",
  "i",
  "me",
  "my",
  "we",
  "with",
  "want",
  "something",
  "one",
  "that",
  "this",
  "can",
  "both",
  "actually",
  "properly",
  "kind",
  "show",
  "series",
  "watch",
  "watching",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP.has(word));
}

function has(query: string, ...needles: string[]): boolean {
  return needles.some((needle) => query.includes(needle));
}

export function scoreSeries(item: Series, query: string): number {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return 0;

  let score = 0.12;
  const hay = `${item.name} ${item.facts} ${item.genres.join(" ")} ${SERVICES[item.group].label}`.toLowerCase();
  const words = tokens(q);

  for (const word of words) {
    if (hay.includes(word)) score += 0.08;
  }

  if (has(q, "short", "few episode", "under 10", "under ten", "weekend", "one season", "limited")) {
    score += item.episodes <= 16 ? 0.38 : item.episodes <= 30 ? 0.08 : -0.28;
  }
  if (has(q, "long", "disappear", "binge forever", "hundreds", "many episode")) {
    score += item.episodes >= 80 ? 0.4 : item.episodes >= 40 ? 0.18 : -0.2;
  }
  if (has(q, "finished", "ended", "complete", "over", "done")) {
    score += item.finished ? 0.32 : -0.35;
    if (item.fumbledEnding) score -= 0.18;
  }
  if (has(q, "still going", "ongoing", "more coming")) {
    score += item.finished ? -0.3 : 0.28;
  }
  if (has(q, "nothing heavy", "not upset", "comfort", "light", "gentle", "cozy", "easy", "kind")) {
    score += item.intensity <= 2 ? 0.36 : item.intensity === 3 ? 0.05 : -0.34;
  }
  if (has(q, "gripped", "tense", "thriller", "edge", "intense", "dark")) {
    score += item.intensity >= 4 ? 0.32 : item.intensity === 3 ? 0.12 : -0.22;
  }
  if (has(q, "violent", "gory", "brutal", "blood")) {
    score += item.intensity >= 5 ? 0.38 : item.intensity === 4 ? 0.16 : -0.3;
  }
  if (has(q, "funny", "comedy", "laugh")) {
    score += item.genres.includes("comedy") || item.genres.includes("satire") ? 0.32 : -0.18;
  }
  if (has(q, "no plot", "background", "on in the", "other room", "wallpaper")) {
    score += item.background ? 0.4 : -0.3;
  }
  if (has(q, "parents", "family", "kids", "wholesome", "everyone")) {
    score += item.family ? 0.36 : -0.34;
  }
  if (has(q, "both agree", "both watch", "couple", "date", "partner")) {
    const easy = item.family || item.background || item.genres.includes("comedy") || item.genres.includes("romance");
    score += easy && item.intensity <= 3 ? 0.28 : item.intensity >= 5 ? -0.22 : 0.08;
  }
  if (has(q, "prestige", "serious", "smart", "literary")) {
    score += item.intensity >= 3 && !item.background ? 0.22 : -0.1;
  }
  if (has(q, "anime", "animated", "animation", "cartoon")) {
    const animated =
      item.genres.includes("anime") || item.genres.includes("animation") || item.group === "crunchyroll";
    score += animated ? 0.4 : -0.28;
  }
  if (has(q, "sci-fi", "scifi", "science fiction", "space")) {
    score += item.genres.includes("sci-fi") ? 0.3 : -0.12;
  }
  if (has(q, "fantasy", "dragon", "magic")) {
    score += item.genres.includes("fantasy") ? 0.3 : -0.12;
  }
  if (has(q, "spy", "cia", "mi5")) {
    score += item.genres.includes("spy") ? 0.35 : -0.1;
  }
  if (has(q, "reality")) {
    score += item.genres.includes("reality") ? 0.45 : -0.2;
  }

  for (const service of Object.values(SERVICES)) {
    const name = service.label.toLowerCase();
    if (q.includes(name) || q.includes(name.replace("+", " plus")) || q.includes(name.replace(" video", ""))) {
      score += item.group === service.id ? 0.45 : -0.4;
    }
  }

  const clamped = Math.min(0.97, Math.max(0.02, score));
  return Math.round(clamped * 100) / 100;
}

export function scoreCatalog(items: Series[], query: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.id, scoreSeries(item, query));
  return map;
}
