import { describe, test } from "node:test";
import { deepStrictEqual } from "node:assert/strict";
import type { PublicProperty } from "./public-properties.functions";
import { selectSeoFeaturedProperties } from "./seo-featured-properties";

const property = (id: string, overrides: Partial<PublicProperty> = {}) => ({
  id, municipality: "Pontremoli", location: "Pontremoli", category: "vendita", isRent: false,
  image: "/real-cover.jpg", featured: false, ...overrides,
}) as PublicProperty;

describe("real catalogue selection", () => {
  test("excludes rentals", () => {
    deepStrictEqual(selectSeoFeaturedProperties([property("rent", { isRent: true, category: "affitto" }), property("sale")], "lunigiana").map(p => p.id), ["sale"]);
  });
  test("Pontremoli selection excludes other municipalities", () => {
    deepStrictEqual(selectSeoFeaturedProperties([property("bagnone", { municipality: "Bagnone" }), property("pontremoli")], "pontremoli").map(p => p.id), ["pontremoli"]);
  });
  test("Lunigiana selection uses only served municipalities", () => {
    deepStrictEqual(selectSeoFeaturedProperties([property("bagnone", { municipality: "Bagnone" }), property("rome", { municipality: "Roma" })], "lunigiana").map(p => p.id), ["bagnone"]);
  });
  test("prioritizes actual featured flag and preserves catalogue order", () => {
    deepStrictEqual(selectSeoFeaturedProperties([property("a"), property("b", { featured: true }), property("c"), property("d")], "pontremoli").map(p => p.id), ["b", "a", "c"]);
  });
  test("excludes missing covers and duplicates", () => {
    deepStrictEqual(selectSeoFeaturedProperties([property("missing", { image: "" }), property("a"), property("a")], "pontremoli").map(p => p.id), ["a"]);
  });
});