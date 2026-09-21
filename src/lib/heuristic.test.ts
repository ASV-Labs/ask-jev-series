import assert from "node:assert/strict";
import test from "node:test";
import { SERIES } from "../data/series";
import { scoreSeries } from "./heuristic";

function top(query: string, n = 5) {
  return SERIES.map((item) => ({ item, p: scoreSeries(item, query) }))
    .sort((a, b) => b.p - a.p)
    .slice(0, n);
}

test("short finished picks compact ended shows", () => {
  const names = top("only a few episodes and it ended properly").map((row) => row.item.name);
  assert.ok(names.includes("Baby Reindeer") || names.includes("Shōgun") || names.includes("The Penguin"));
});

test("background comedy ranks The Office", () => {
  const office = SERIES.find((item) => item.id === "the-office-us");
  assert.ok(office);
  assert.ok(scoreSeries(office, "funny, no plot, on in the background") >= 0.9);
});

test("Netflix filter prefers Netflix titles", () => {
  const ranked = top("gripping thriller on Netflix", 6);
  assert.ok(ranked.filter((row) => row.item.group === "netflix").length >= 3);
});

test("catalog has every top service", () => {
  const groups = new Set(SERIES.map((item) => item.group));
  for (const id of ["netflix", "prime", "disney", "max", "apple", "hulu", "paramount", "peacock", "crunchyroll"]) {
    assert.ok(groups.has(id as (typeof SERIES)[number]["group"]), id);
  }
  assert.ok(SERIES.length >= 80);
});
