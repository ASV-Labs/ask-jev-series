import { SERIES } from "@/data/series";
import { askJev } from "@/lib/jev";
import { FILTER_OPTIONS } from "@/lib/services";
import type { ServiceId } from "@/lib/types";

export const runtime = "nodejs";

const GROUPS = new Set(FILTER_OPTIONS.map((option) => option.id));

export async function POST(request: Request) {
  let body: { query?: unknown; group?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const group = typeof body.group === "string" ? body.group : "all";

  if (query.length < 3 || query.length > 160) {
    return Response.json({ error: "Ask in a short sentence." }, { status: 400 });
  }
  if (!GROUPS.has(group)) {
    return Response.json({ error: "Unknown service." }, { status: 400 });
  }

  const items = group === "all" ? SERIES : SERIES.filter((item) => item.group === (group as ServiceId));
  try {
    const result = await askJev(items, query, request.signal);
    return Response.json(result);
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    const message = error instanceof Error ? error.message : "Jev could not answer that one.";
    return Response.json({ error: message }, { status: 502 });
  }
}
