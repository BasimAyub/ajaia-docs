"use client";

import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { renameDocument } from "@/app/actions";

type DocumentTitleFormProps = {
  documentId: string;
  title: string;
  canEdit: boolean;
};

export function DocumentTitleForm({ documentId, title, canEdit }: DocumentTitleFormProps) {
  const [value, setValue] = useState(title);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-3xl"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await renameDocument(formData);
          if (!result.ok) {
            setMessage(result.message);
          }
        });
      }}
    >
      <input type="hidden" name="documentId" value={documentId} />
      <label className="sr-only" htmlFor="document-title">
        Document title
      </label>
      <div className="flex items-center gap-2">
        <input
          id="document-title"
          name="title"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          readOnly={!canEdit}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-3xl font-bold text-ink outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/20 read-only:cursor-default sm:text-4xl"
        />
        {canEdit ? (
          <button
            type="submit"
            disabled={pending || value.trim() === title}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-moss transition hover:border-moss focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Rename document"
            title="Rename document"
          >
            <Pencil size={17} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {message ? <p className="mt-2 text-sm font-medium text-clay">{message}</p> : null}
    </form>
  );
}
