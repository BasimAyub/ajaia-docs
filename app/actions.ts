"use server";

import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { canEditDocument, canShareDocument } from "@/lib/documents/permissions";
import {
  createDocumentSchema,
  importDocumentSchema,
  MAX_IMPORT_BYTES,
  renameDocumentSchema,
  saveDocumentSchema,
  shareDocumentSchema
} from "@/lib/documents/validation";
import { emptyDocumentContent, textToTiptapDocument, tiptapToPlainText } from "@/lib/editor/content";
import { getCurrentDemoUser, USER_COOKIE } from "@/lib/session";
import { isSeededUserId } from "@/lib/users";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

function fail(message: string): ActionResult {
  return { ok: false, message };
}

function actionError(action: string, error: unknown): ActionResult {
  console.error(`Ajaia Docs ${action} action failed.`, error);
  return fail("Something went wrong. Please try again.");
}

async function getActionUser() {
  const user = await getCurrentDemoUser();
  return user ?? null;
}

export async function switchUser(userId: string) {
  if (!isSeededUserId(userId)) {
    return fail("Choose one of the seeded demo identities.");
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return fail("That demo identity is not available. Seed the database and try again.");
    }

    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  } catch (error) {
    return actionError("switch identity", error);
  }

  revalidatePath("/");
  redirect("/");
}

export async function createDocument(formData?: FormData) {
  const parsed = createDocumentSchema.safeParse({
    title: formData?.get("title")?.toString() || "Untitled document"
  });

  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Could not create the document.");
  }

  let document: { id: string };
  try {
    const user = await getActionUser();
    if (!user) {
      return fail("The demo workspace is not ready. Seed the database and try again.");
    }

    document = await prisma.document.create({
      data: {
        title: parsed.data.title,
        ownerId: user.id,
        contentJson: JSON.stringify(emptyDocumentContent),
        plainText: ""
      },
      select: { id: true }
    });
  } catch (error) {
    return actionError("create document", error);
  }

  revalidatePath("/");
  redirect(`/documents/${document.id}`);
}

export async function renameDocument(formData: FormData): Promise<ActionResult> {
  const parsed = renameDocumentSchema.safeParse({
    documentId: formData.get("documentId"),
    title: formData.get("title")
  });

  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Could not rename the document.");
  }

  try {
    const user = await getActionUser();
    if (!user) {
      return fail("The demo workspace is not ready. Seed the database and try again.");
    }
    const document = await prisma.document.findUnique({
      where: { id: parsed.data.documentId },
      select: { ownerId: true, shares: { select: { userId: true, role: true } } }
    });

    if (!document || !canEditDocument(document, user.id)) {
      return fail("You do not have permission to rename this document.");
    }

    await prisma.document.update({
      where: { id: parsed.data.documentId },
      data: { title: parsed.data.title }
    });
  } catch (error) {
    return actionError("rename document", error);
  }

  revalidatePath("/");
  revalidatePath(`/documents/${parsed.data.documentId}`);
  return { ok: true };
}

export async function saveDocument(input: {
  documentId: string;
  content: JSONContent;
}): Promise<ActionResult<{ updatedAt: string }>> {
  const parsed = saveDocumentSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Could not save the document.");
  }

  let updated: { updatedAt: Date };
  try {
    const user = await getActionUser();
    if (!user) {
      return fail("The demo workspace is not ready. Seed the database and try again.");
    }
    const document = await prisma.document.findUnique({
      where: { id: parsed.data.documentId },
      select: { ownerId: true, shares: { select: { userId: true, role: true } } }
    });

    if (!document || !canEditDocument(document, user.id)) {
      return fail("You do not have permission to edit this document.");
    }

    updated = await prisma.document.update({
      where: { id: parsed.data.documentId },
      data: {
        contentJson: JSON.stringify(parsed.data.content),
        plainText: tiptapToPlainText(parsed.data.content)
      },
      select: { updatedAt: true }
    });
  } catch (error) {
    return actionError("save document", error) as ActionResult<{ updatedAt: string }>;
  }

  revalidatePath("/");
  return { ok: true, data: { updatedAt: updated.updatedAt.toISOString() } };
}

export async function importDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("Choose a .txt or .md file to import.");
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return fail("Imports are limited to .txt and .md files up to 250 KB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["txt", "md"].includes(extension ?? "")) {
    return fail("Only .txt and .md imports are supported in this submission.");
  }

  const acceptedMimeTypes = new Set([
    "",
    "application/octet-stream",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
    "application/x-markdown"
  ]);
  if (!acceptedMimeTypes.has(file.type.toLowerCase())) {
    return fail("Choose a plain-text .txt or .md file.");
  }

  let text: string;
  try {
    text = await file.text();
  } catch (error) {
    return actionError("read import", error);
  }
  const parsed = importDocumentSchema.safeParse({
    title: file.name.replace(/\.(txt|md)$/i, ""),
    text
  });

  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Could not import that file.");
  }

  let document: { id: string };
  try {
    const user = await getActionUser();
    if (!user) {
      return fail("The demo workspace is not ready. Seed the database and try again.");
    }
    const content = textToTiptapDocument(parsed.data.text);
    document = await prisma.document.create({
      data: {
        title: parsed.data.title,
        ownerId: user.id,
        contentJson: JSON.stringify(content),
        plainText: tiptapToPlainText(content)
      },
      select: { id: true }
    });
  } catch (error) {
    return actionError("import document", error);
  }

  revalidatePath("/");
  redirect(`/documents/${document.id}`);
}

export async function shareDocument(formData: FormData): Promise<ActionResult> {
  const parsed = shareDocumentSchema.safeParse({
    documentId: formData.get("documentId"),
    userId: formData.get("userId"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Could not share this document.");
  }

  if (!isSeededUserId(parsed.data.userId)) {
    return fail("Choose one of the seeded demo identities.");
  }

  try {
    const user = await getActionUser();
    if (!user) {
      return fail("The demo workspace is not ready. Seed the database and try again.");
    }
    const [document, recipient] = await Promise.all([
      prisma.document.findUnique({
        where: { id: parsed.data.documentId },
        select: { ownerId: true, shares: { select: { userId: true, role: true } } }
      }),
      prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true } })
    ]);

    if (!document) {
      return fail("That document is no longer available.");
    }
    if (!canShareDocument(document, user.id)) {
      return fail("Only the owner can share this document.");
    }
    if (!recipient) {
      return fail("That demo identity is not available. Seed the database and try again.");
    }
    if (recipient.id === document.ownerId) {
      return fail("Owners already have full access.");
    }

    await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: parsed.data.documentId,
          userId: recipient.id
        }
      },
      update: { role: parsed.data.role },
      create: {
        documentId: parsed.data.documentId,
        userId: recipient.id,
        role: parsed.data.role
      }
    });
  } catch (error) {
    return actionError("share document", error);
  }

  revalidatePath("/");
  revalidatePath(`/documents/${parsed.data.documentId}`);
  return { ok: true };
}
