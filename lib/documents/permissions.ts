import type { DocumentShare } from "@prisma/client";

export type DocumentAccessRecord = {
  ownerId: string;
  shares: Pick<DocumentShare, "userId" | "role">[];
};

export type AccessLevel = "owner" | "editor" | "viewer" | "none";

const roleRank: Record<AccessLevel, number> = {
  none: 0,
  viewer: 1,
  editor: 2,
  owner: 3
};

export function getAccessLevel(document: DocumentAccessRecord, userId: string): AccessLevel {
  if (document.ownerId === userId) {
    return "owner";
  }

  const share = document.shares.find((candidate) => candidate.userId === userId);
  if (!share) {
    return "none";
  }

  return share.role === "EDITOR" ? "editor" : "viewer";
}

export function canReadDocument(document: DocumentAccessRecord, userId: string) {
  return roleRank[getAccessLevel(document, userId)] >= roleRank.viewer;
}

export function canEditDocument(document: DocumentAccessRecord, userId: string) {
  return roleRank[getAccessLevel(document, userId)] >= roleRank.editor;
}

export function canShareDocument(document: DocumentAccessRecord, userId: string) {
  return getAccessLevel(document, userId) === "owner";
}

export function normalizeShareRole(role: string) {
  return role === "VIEWER" ? "Can view" : "Can edit";
}
