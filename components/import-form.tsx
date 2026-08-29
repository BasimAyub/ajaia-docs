"use client";

import { Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { importDocument } from "@/app/actions";
import { Button } from "./button";

export function ImportForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await importDocument(formData);
          if (result && !result.ok) {
            setMessage(result.message);
          }
        });
      }}
    >
      <div className="min-w-0">
        <label className="block text-sm font-medium text-ink" htmlFor="file">
          Import .txt or .md
        </label>
        <p className="text-xs leading-5 text-zinc-500">Supports .txt and .md files up to 250 KB.</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="file"
          name="file"
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="min-h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:font-medium file:text-ink"
        />
        <Button type="submit" disabled={pending} variant="secondary">
          <Upload size={16} aria-hidden="true" />
          {pending ? "Importing" : "Import"}
        </Button>
      </div>
      {message ? <p className="text-sm font-medium text-clay sm:ml-2">{message}</p> : null}
    </form>
  );
}
