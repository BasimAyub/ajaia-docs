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
      className="rounded-md border border-dashed border-moss/30 bg-white/76 p-4"
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
      <label className="block text-sm font-semibold text-ink" htmlFor="file">
        Import .txt or .md
      </label>
      <p className="mt-1 text-sm leading-6 text-ink/62">
        Supports .txt and .md files up to 250 KB. Imports become editable rich-text documents.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          id="file"
          name="file"
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="min-h-10 flex-1 rounded-md border border-ink/12 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-1.5 file:font-semibold file:text-moss"
        />
        <Button type="submit" disabled={pending} variant="secondary">
          <Upload size={16} aria-hidden="true" />
          {pending ? "Importing" : "Import"}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm font-medium text-clay">{message}</p> : null}
    </form>
  );
}
