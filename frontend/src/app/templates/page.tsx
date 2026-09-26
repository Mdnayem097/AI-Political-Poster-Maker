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

      <main className="min-h-[calc(100vh-57px)] bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Header */}
          <section className="mb-8">
            <p className="text-sm font-medium text-green-700">
              Start creating
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Choose a template
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Select a poster layout that matches your occasion, then add your
              details and photos to create your poster.
            </p>
          </section>

          {/* Loading */}
          {loading && (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="aspect-[3/4] animate-pulse bg-gray-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Error */}
          {!loading && error && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-semibold text-red-800">
                Could not load templates
              </h2>

              <p className="mt-1 text-sm text-red-600">{error}</p>
            </section>
          )}

          {/* Empty */}
          {!loading && !error && templates.length === 0 && (
            <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h2 className="font-semibold text-gray-900">
                No templates available
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                There are no poster templates available right now.
              </p>

              <Link
                href="/dashboard"
                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Back to Dashboard
              </Link>
            </section>
          )}

          {/* Template Grid */}
          {!loading && !error && templates.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {templates.length}{" "}
                  {templates.length === 1 ? "template" : "templates"} available
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Link
                    key={template._id}
                    href={`/posters/new?templateId=${template._id}`}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={template.thumbnailUrl}
                        alt={template.title}
                        className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                        {template.occasionType}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900">
                        {template.title}
                      </h2>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Poster template
                        </span>

                        <span className="text-sm font-semibold text-green-700 transition group-hover:text-green-800">
                          Use template →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}