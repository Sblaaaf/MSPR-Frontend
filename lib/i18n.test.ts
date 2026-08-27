import { describe, expect, it } from "vitest";
import { translations } from "./i18n";

describe("translations", () => {
  it("has the same set of keys in en and fr (no missing/extra translation)", () => {
    const enKeys = Object.keys(translations.en).sort();
    const frKeys = Object.keys(translations.fr).sort();

    expect(frKeys).toEqual(enKeys);
  });

  it("has no empty string values", () => {
    for (const [lang, dict] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), `${lang}.${key} should not be empty`).not.toBe("");
      }
    }
  });
});
