import { describe, it, expect } from "vitest";

// Replicate the parseDescription function from marketplace/page.tsx
function parseDescription(raw: string): { text: string; images: string[]; category: string } {
  try {
    const parsed = JSON.parse(raw);
    return {
      text: parsed.text ?? raw,
      images: Array.isArray(parsed.images) ? parsed.images : [],
      category: parsed.category ?? "",
    };
  } catch {
    return { text: raw, images: [], category: "" };
  }
}

describe("parseDescription", () => {
  it("parses valid JSON with all fields", () => {
    const raw = JSON.stringify({
      text: "A nice laptop",
      images: ["https://ipfs.io/img1.jpg", "https://ipfs.io/img2.jpg"],
      category: "Physical Goods",
    });
    const result = parseDescription(raw);
    expect(result.text).toBe("A nice laptop");
    expect(result.images).toEqual(["https://ipfs.io/img1.jpg", "https://ipfs.io/img2.jpg"]);
    expect(result.category).toBe("Physical Goods");
  });

  it("handles JSON without images", () => {
    const raw = JSON.stringify({ text: "Logo design" });
    const result = parseDescription(raw);
    expect(result.text).toBe("Logo design");
    expect(result.images).toEqual([]);
    expect(result.category).toBe("");
  });

  it("handles JSON without category", () => {
    const raw = JSON.stringify({ text: "Work", images: ["img.jpg"] });
    const result = parseDescription(raw);
    expect(result.text).toBe("Work");
    expect(result.images).toEqual(["img.jpg"]);
    expect(result.category).toBe("");
  });

  it("handles JSON with non-array images (falls back to empty)", () => {
    const raw = JSON.stringify({ text: "Test", images: "not-an-array" });
    const result = parseDescription(raw);
    expect(result.images).toEqual([]);
  });

  it("handles plain text (non-JSON)", () => {
    const raw = "Just a plain description";
    const result = parseDescription(raw);
    expect(result.text).toBe("Just a plain description");
    expect(result.images).toEqual([]);
    expect(result.category).toBe("");
  });

  it("handles empty string", () => {
    const result = parseDescription("");
    expect(result.text).toBe("");
    expect(result.images).toEqual([]);
  });

  it("handles malformed JSON", () => {
    const result = parseDescription("{broken json");
    expect(result.text).toBe("{broken json");
    expect(result.images).toEqual([]);
    expect(result.category).toBe("");
  });

  it("handles JSON with null text (falls back to raw)", () => {
    const raw = JSON.stringify({ text: null, images: [] });
    const result = parseDescription(raw);
    // text ?? raw → raw is the full JSON string
    expect(result.text).toBe(raw);
  });

  it("preserves all image URLs", () => {
    const images = [
      "https://ipfs.io/ipfs/Qm1",
      "https://ipfs.io/ipfs/Qm2",
      "https://ipfs.io/ipfs/Qm3",
      "https://ipfs.io/ipfs/Qm4",
    ];
    const raw = JSON.stringify({ text: "Hi", images });
    const result = parseDescription(raw);
    expect(result.images).toEqual(images);
    expect(result.images).toHaveLength(4);
  });

  it("handles JSON with extra fields (ignores them)", () => {
    const raw = JSON.stringify({
      text: "Deal",
      images: [],
      category: "Design",
      extraField: "ignored",
      price: 100,
    });
    const result = parseDescription(raw);
    expect(result.text).toBe("Deal");
    expect(result.category).toBe("Design");
    expect(result.images).toEqual([]);
  });

  it("handles empty JSON object", () => {
    const raw = JSON.stringify({});
    const result = parseDescription(raw);
    expect(result.text).toBe(raw); // text is undefined, fallback to raw
    expect(result.images).toEqual([]);
    expect(result.category).toBe("");
  });
});
