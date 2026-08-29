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
      include: { owner: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.document.findMany({
      where: {
        shares: {
          some: { userId: currentUserId }
        }
      },
      include: { owner: true, shares: true },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-6 sm:px-8">
      <header className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Ajaia Docs</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">Shared work, written clearly.</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-ink/68">
            A focused Google Docs-inspired slice with rich text editing, imports, autosave, and
            server-side access rules.
          </p>
        </div>
        <UserSwitcher currentUserId={currentUserId} />
      </header>

      <section className="grid gap-4 py-6 lg:grid-cols-[1fr_360px]">
        <CreateDocumentForm />
        <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-ink">Current workspace</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white"
              style={{ backgroundColor: currentUser.color }}
              aria-hidden="true"
            >
              {currentUser.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <div>
              <p className="font-semibold text-ink">{currentUser.name}</p>
              <p className="text-sm text-ink/58">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
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
        </div>
        <div className="space-y-4">
          <ImportForm />
          <div className="rounded-md border border-ink/10 bg-white/84 p-4 text-sm leading-6 text-ink/66 shadow-sm">
            <p className="font-semibold text-ink">Review mode</p>
            <p className="mt-1">
              This review build uses seeded identities so sharing and permissions can be evaluated
              without account setup.
            </p>
          </div>
        </div>
      </section>
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
  include: { owner: true };
}>;

function DocumentSection({ title, empty, documents, label }: DocumentSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <span className="rounded-md bg-sage px-2 py-1 text-xs font-bold text-moss">
          {documents.length}
        </span>
      </div>
      {documents.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/14 bg-white/70 p-6 text-sm text-ink/60">
          {empty}
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} label={label} />
          ))}
        </div>
      )}
    </section>
  );
}
