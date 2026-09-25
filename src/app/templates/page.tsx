"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Template[]>("/api/templates")
      .then((res) => setTemplates(res.data))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Could not load templates",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <Navbar />

      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Choose a template</h1>

        {loading && <p>Loading templates...</p>}

        {error && <p className="rounded bg-red-50 p-2 text-red-600">{error}</p>}

        {!loading && !error && templates.length === 0 && (
          <p>No templates found.</p>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template._id}
              href={`/posters/new?templateId=${template._id}`}
              className="overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.thumbnailUrl}
                alt={template.title}
                className="aspect-[3/4] w-full object-cover"
              />

              <div className="p-3">
                <p className="font-semibold">{template.title}</p>
                <p className="text-sm text-gray-500">{template.occasionType}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}
