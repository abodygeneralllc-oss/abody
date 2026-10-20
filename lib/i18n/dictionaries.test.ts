import { describe, expect, it } from "vitest";
import { ar } from "@/lib/i18n/dictionaries/ar";
import { en } from "@/lib/i18n/dictionaries/en";

// Every string leaf with its path; function values are skipped.
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    strings(child, path ? `${path}.${key}` : key),
  );
}

describe("customer dictionaries", () => {
  it.each([
    ["en", en],
    ["ar", ar],
  ])("never name the payment processor in %s", (_, dictionary) => {
    const leaves = strings(dictionary);
    expect(leaves.length).toBeGreaterThan(100);
    expect(leaves.filter(([, text]) => /stripe/i.test(text))).toEqual([]);
  });
});
