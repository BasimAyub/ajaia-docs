import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

export const MAX_IMPORT_BYTES = 250 * 1024;

export const titleSchema = z
  .string()
  .trim()
  .min(1, "Document title is required.")
  .max(90, "Keep titles under 90 characters.");

export const tiptapContentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.unknown()).optional()
  })
  .transform((value) => value as JSONContent);

export const saveDocumentSchema = z.object({
  documentId: z.string().min(1),
  content: tiptapContentSchema
});

export const renameDocumentSchema = z.object({
  documentId: z.string().min(1),
  title: titleSchema
});

export const createDocumentSchema = z.object({
  title: titleSchema.default("Untitled document")
});

export const importDocumentSchema = z.object({
  title: titleSchema,
  text: z.string().max(MAX_IMPORT_BYTES, "Imports are limited to 250 KB of text.")
});

export const shareDocumentSchema = z.object({
  documentId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["VIEWER", "EDITOR"])
});
