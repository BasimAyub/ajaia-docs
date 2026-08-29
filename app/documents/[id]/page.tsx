import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DocumentEditor } from "@/components/document-editor";
import { DocumentTitleForm } from "@/components/document-title-form";
import { SharePanel } from "@/components/share-panel";
import { prisma } from "@/lib/db";
import {
  canEditDocument,
  canReadDocument,
  canShareDocument,
  getAccessLevel
} from "@/lib/documents/permissions";
import { getCurrentUserId } from "@/lib/session";
import { getSeededUser } from "@/lib/users";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUserId = await getCurrentUserId();
  const currentUser = getSeededUser(currentUserId);
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: true,
      shares: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!document || !canReadDocument(document, currentUserId)) {
    notFound();
  }

  const accessLevel = getAccessLevel(document, currentUserId);
  const canEdit = canEditDocument(document, currentUserId);
  const canShare = canShareDocument(document, currentUserId);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-5 sm:px-8">
      <header className="mb-5 flex flex-col gap-4 border-b border-ink/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-moss transition hover:bg-sage focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Dashboard
          </Link>
          <DocumentTitleForm documentId={document.id} title={document.title} canEdit={canEdit} />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink/60">
            <span>Owner: {document.owner.name}</span>
            <span aria-hidden="true">/</span>
            <span>Viewing as {currentUser.name}</span>
            <span aria-hidden="true">/</span>
            <span className="rounded-md bg-sage px-2 py-1 font-semibold text-moss">
              {accessLevel === "owner"
                ? "Owner"
                : accessLevel === "editor"
                  ? "Editor"
                  : "Viewer"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <DocumentEditor
          documentId={document.id}
          initialContent={JSON.parse(document.contentJson) as JSONContent}
          canEdit={canEdit}
        />
        <SharePanel
          documentId={document.id}
          ownerId={document.ownerId}
          canShare={canShare}
          shares={document.shares}
        />
      </div>
    </main>
  );
}
