import { describe, expect, it } from "vitest";
import {
  canEditDocument,
  canReadDocument,
  canShareDocument,
  getAccessLevel
} from "@/lib/documents/permissions";

const document = {
  ownerId: "daniel",
  shares: [
    { userId: "maya", role: "EDITOR" as const },
    { userId: "elena", role: "VIEWER" as const }
  ]
};

describe("document permissions", () => {
  it("gives owners full access including sharing", () => {
    expect(getAccessLevel(document, "daniel")).toBe("owner");
    expect(canReadDocument(document, "daniel")).toBe(true);
    expect(canEditDocument(document, "daniel")).toBe(true);
    expect(canShareDocument(document, "daniel")).toBe(true);
  });

  it("allows shared editors to read and edit without owner-only sharing", () => {
    expect(getAccessLevel(document, "maya")).toBe("editor");
    expect(canReadDocument(document, "maya")).toBe(true);
    expect(canEditDocument(document, "maya")).toBe(true);
    expect(canShareDocument(document, "maya")).toBe(false);
  });

  it("keeps viewers and unrelated users out of write paths", () => {
    expect(canReadDocument(document, "elena")).toBe(true);
    expect(canEditDocument(document, "elena")).toBe(false);
    expect(canShareDocument(document, "elena")).toBe(false);
    expect(canReadDocument(document, "outside-user")).toBe(false);
    expect(canEditDocument(document, "outside-user")).toBe(false);
  });
});
