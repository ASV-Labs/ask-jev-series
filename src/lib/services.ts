import type { ServiceId } from "./types";

export const SERVICES: Record<
  ServiceId,
  { id: ServiceId; label: string; short: string; color: string; ink: string }
> = {
  netflix: { id: "netflix", label: "Netflix", short: "N", color: "#E50914", ink: "#fff" },
  prime: { id: "prime", label: "Prime Video", short: "P", color: "#00A8E1", ink: "#041C2C" },
  disney: { id: "disney", label: "Disney+", short: "D", color: "#113CCF", ink: "#fff" },
  max: { id: "max", label: "Max", short: "M", color: "#5B2CFF", ink: "#fff" },
  apple: { id: "apple", label: "Apple TV+", short: "A", color: "#1D1D1F", ink: "#fff" },
  hulu: { id: "hulu", label: "Hulu", short: "H", color: "#1CE783", ink: "#04210F" },
  paramount: { id: "paramount", label: "Paramount+", short: "+", color: "#0064FF", ink: "#fff" },
  peacock: { id: "peacock", label: "Peacock", short: "Pk", color: "#F4C10B", ink: "#111" },
  crunchyroll: { id: "crunchyroll", label: "Crunchyroll", short: "C", color: "#F47521", ink: "#fff" },
};

export const SERVICE_ORDER: ServiceId[] = [
  "netflix",
  "prime",
  "disney",
  "max",
  "apple",
  "hulu",
  "paramount",
  "peacock",
  "crunchyroll",
];

export const FILTER_OPTIONS = [
  { id: "all", label: "All services" },
  ...SERVICE_ORDER.map((id) => ({ id, label: SERVICES[id].label })),
];
