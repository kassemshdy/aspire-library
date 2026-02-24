"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@prisma/client";

type BookFormProps = {
  mode: "create" | "edit";
  initial?: Book | null;
};

export function BookForm({ mode, initial }: BookFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [isbn, setIsbn] = useState(initial?.isbn ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "");
  const [publishedYear, setPublishedYear] = useState(
    initial?.publishedYear?.toString() ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = async () => {
    if (!title || !author) {
      setError("Title and author are required to generate description");
      return;
    }

    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          category: category || undefined,
          year: publishedYear ? Number(publishedYear) : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await res.json();
      setDescription(data.description);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to generate description");
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        title,
        author,
        isbn: isbn || null,
        category: category || null,
        language: language || null,
        publishedYear: publishedYear ? Number(publishedYear) : null,
        description: description || null,
      };

      const res = await fetch(
        mode === "create" ? "/api/books" : `/api/books/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save book");
      }

      router.push("/books");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
        <Field label="Author" required>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
        <Field label="ISBN">
          <input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
        <Field label="Category">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
        <Field label="Language">
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
        <Field label="Year">
          <input
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value)}
            type="number"
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </Field>
      </div>
      <Field label="Description">
        <div className="space-y-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={generateDescription}
            disabled={aiLoading || !title || !author}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-zinc-400 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {aiLoading ? "✨ Generating..." : "✨ Generate with AI"}
          </button>
        </div>
      </Field>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Saving..." : mode === "create" ? "Create book" : "Save"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
      <span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

