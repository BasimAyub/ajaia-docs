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
    <main className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-3 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-zinc-600 transition-colors hover:text-moss focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Documents
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 py-6 sm:px-8">
        <section className="mx-auto max-w-[850px]">
          <DocumentTitleForm documentId={document.id} title={document.title} canEdit={canEdit} />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Owner: {document.owner.name}</span>
            <span aria-hidden="true">/</span>
            <span>Viewing as {currentUser.name}</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-moss">
              {accessLevel === "owner"
                ? "Owner"
                : accessLevel === "editor"
                  ? "Editor"
                  : "Viewer"}
            </span>
          </div>
        </section>

        <div className="mx-auto mt-6 grid max-w-[1180px] justify-items-center gap-6 xl:grid-cols-[minmax(0,850px)_280px] xl:justify-center">
          <div className="w-full max-w-[850px]">
            <DocumentEditor
              documentId={document.id}
              initialContent={JSON.parse(document.contentJson) as JSONContent}
              canEdit={canEdit}
            />
          </div>
          <SharePanel
            documentId={document.id}
            ownerId={document.ownerId}
            canShare={canShare}
            shares={document.shares}
          />
        </div>
      </div>
    </main>
  );
}
