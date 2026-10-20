import { beforeEach, describe, expect, it, vi } from "vitest";

const { db, requireAdmin, revalidatePath } = vi.hoisted(() => ({
  db: { siteContent: { upsert: vi.fn() } },
  // Throws in Next.js, ending the action.
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/admin", () => ({ requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { saveSiteContent } from "./admin-site-content";

// The hero radios always send a value, so every form starts with one.
function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  const all = { heroStyle: "NAVY", heroPhoto: "BROWSING", ...fields };
  for (const [key, value] of Object.entries(all)) data.set(key, value);
  return data;
}

beforeEach(() => {
  requireAdmin.mockReset().mockResolvedValue({ id: "admin", role: "ADMIN" });
  db.siteContent.upsert.mockReset().mockResolvedValue({ id: 1 });
  revalidatePath.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("saveSiteContent", () => {
  it("stops before any write when requireAdmin throws", async () => {
    requireAdmin.mockRejectedValue(new Error("NEXT_NOT_FOUND"));

    await expect(saveSiteContent(null, form({ heroTitle: "Hi" }))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(db.siteContent.upsert).not.toHaveBeenCalled();
  });

  it("returns field errors and the typed values without writing", async () => {
    const result = await saveSiteContent(
      null,
      form({ heroTitle: "x".repeat(121), announcementEnabled: "on", announcementText: "Sale" }),
    );

    expect(result).toMatchObject({
      success: false,
      error: "invalid_fields",
      fieldErrors: { heroTitle: "too_long", announcementTextAr: "required" },
      values: { announcementText: "Sale", announcementEnabled: true },
    });
    expect(db.siteContent.upsert).not.toHaveBeenCalled();
  });

  it("upserts row 1 with null for blank text and refreshes the store", async () => {
    const result = await saveSiteContent(
      null,
      form({
        heroTitle: " Grow ",
        heroTitleAr: "",
        showFeatured: "on",
        heroStyle: "PHOTO",
        heroPhoto: "TEAM",
      }),
    );

    expect(result).toEqual({ success: true });
    const call = db.siteContent.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.create).toMatchObject({ id: 1, heroTitle: "Grow", heroTitleAr: null });
    expect(call.update).toMatchObject({
      heroTitle: "Grow",
      heroTitleAr: null,
      showFeatured: true,
      showCta: false,
      announcementLink: null,
      heroStyle: "PHOTO",
      heroPhoto: "TEAM",
    });
    expect(call.update).not.toHaveProperty("id");
    expect(revalidatePath).toHaveBeenCalledWith("/[lang]", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/content");
  });

  it("returns unexpected when the database write fails", async () => {
    db.siteContent.upsert.mockRejectedValue(new Error("db down"));

    expect(await saveSiteContent(null, form({}))).toEqual({
      success: false,
      error: "unexpected",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
