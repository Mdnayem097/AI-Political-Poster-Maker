"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import { apiRequest, getToken } from "@/lib/api";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    apiRequest<Template[]>("/api/templates")
      .then((res) => setTemplates(res.data))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Could not load templates",
        ),
      )
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Choose a template</h1>

        {loading && <p>Loading templates...</p>}
        {error && <p className="rounded bg-red-50 p-2 text-red-600">{error}</p>}
        {!loading && !error && templates.length === 0 && (
          <p>No templates found.</p>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.map((t) => (
            <Link
              key={t._id}
              href={`/posters/new?templateId=${t._id}`}
              className="overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.thumbnailUrl}
                alt={t.title}
                className="aspect-[3/4] w-full object-cover"
              />

              <div className="p-3">
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-gray-500">{t.occasionType}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
