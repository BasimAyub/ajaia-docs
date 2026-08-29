import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { getSeededUser } from "@/lib/users";
import { CreateDocumentForm } from "@/components/create-document-form";
import { DocumentCard } from "@/components/document-card";
import { ImportForm } from "@/components/import-form";
import { UserSwitcher } from "@/components/user-switcher";

export default async function DashboardPage() {
  const currentUserId = await getCurrentUserId();
  const currentUser = getSeededUser(currentUserId);

  const [ownedDocuments, sharedDocuments] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: currentUserId },
      include: { owner: true, shares: { where: { userId: currentUserId }, select: { role: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.document.findMany({
      where: {
        shares: {
          some: { userId: currentUserId }
        }
      },
      include: { owner: true, shares: { where: { userId: currentUserId }, select: { role: true } } },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <p className="text-sm font-semibold text-ink">
            <span className="text-moss">AJAIA</span> <span className="text-zinc-400">/</span> Docs
          </p>
          <UserSwitcher currentUserId={currentUserId} />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <section className="flex flex-col gap-5 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Documents</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Create, import, and manage documents shared across your workspace.
            </p>
          </div>
          <CreateDocumentForm />
        </section>

        <div className="flex flex-col gap-3 border-b border-zinc-200 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span>Active demo identity: {currentUser.name}</span>
            <span aria-hidden="true">/</span>
            <span>Switch identities to verify sharing and permissions.</span>
          </div>
          <ImportForm />
        </div>

        <section className="max-w-4xl space-y-8 py-7">
          <DocumentSection
            title="Owned by me"
            empty="Create a document to start your private workspace."
            documents={ownedDocuments}
            label="Owner"
          />
          <DocumentSection
            title="Shared with me"
            empty="Documents shared with this demo user will appear here."
            documents={sharedDocuments}
            label="Shared"
          />
        </section>
      </div>
    </main>
  );
}

type DocumentSectionProps = {
  title: string;
  empty: string;
  documents: DashboardDocument[];
  label: string;
};

type DashboardDocument = Prisma.DocumentGetPayload<{
  include: { owner: true; shares: { select: { role: true } } };
}>;

function DocumentSection({ title, empty, documents, label }: DocumentSectionProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        <span className="text-xs font-medium text-zinc-400">
          {documents.length}
        </span>
      </div>
      {documents.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
          {empty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white divide-y divide-zinc-100">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              label={
                label === "Shared"
                  ? document.shares[0]?.role === "EDITOR"
                    ? "Editor"
                    : "Viewer"
                  : label
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
