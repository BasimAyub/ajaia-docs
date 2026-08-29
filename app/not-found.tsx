import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Not found</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">This document is unavailable.</h1>
      <p className="mt-3 text-ink/70">
        It may have been deleted, or the selected demo user may not have access.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
