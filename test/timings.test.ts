import { expect, test } from "bun:test";
import { matchTimings, timingFor } from "../src/timings.ts";

test("a timing records the start and the length of a turn", () => {
  const t = timingFor("  make   a game ", Date.UTC(2026, 10, 12, 22, 0), Date.UTC(2026, 10, 12, 22, 4, 12), true);
  expect(t).toEqual({ text: "make a game", start: "2026-11-12T22:00:00.000Z", ms: 252000, stopped: true });
});

test("timings pair with user messages in order, skipping ones without", () => {
  const ts = [timingFor("a", 0, 1000), timingFor("b", 2000, 5000), timingFor("a", 6000, 6500)];
  const got = matchTimings(["a", "x", "b", "a", "a"], ts);
  expect(got.map((t) => t?.ms)).toEqual([1000, undefined, 3000, 500, undefined]);
});

test("a compacted history still finds its later turns", () => {
  const ts = [timingFor("old", 0, 10), timingFor("new", 20, 50)];
  expect(matchTimings(["Summary of the earlier conversation", "new"], ts).map((t) => t?.ms)).toEqual([undefined, 30]);
});
