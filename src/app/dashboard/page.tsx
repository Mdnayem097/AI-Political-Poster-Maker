"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Template } from "@/types";

export default function DashboardPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [templateError, setTemplateError] = useState("");

    useEffect(() => {
        apiRequest<Template[]>("/api/templates")
            .then((res) => setTemplates(res.data))
            .catch((err) =>
                setTemplateError(
                    err instanceof Error
                        ? err.message
                        : "Could not load templates",
                ),
            )
            .finally(() => setLoadingTemplates(false));
    }, []);

    const featuredTemplates = templates.slice(0, 3);

    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    {/* Hero */}
                    <section className="rounded-2xl bg-white p-8 shadow-sm">
                        <p className="text-sm font-medium text-green-700">
                            AI Political Poster Maker
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            Create your next poster
                        </h1>

                        <p className="mt-3 max-w-2xl text-gray-600">
                            Choose a template, add your campaign details and photos, then
                            generate a printable poster with AI.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/templates"
                                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Create New Poster
                            </Link>

                            <Link
                                href="/posters"
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                My Posters
                            </Link>
                        </div>
                    </section>

                    {/* Quick actions */}
                    <section className="mt-8 grid gap-5 md:grid-cols-3">
                        <Link
                            href="/templates"
                            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-sm font-medium text-gray-500">Start here</p>

                            <h2 className="mt-2 text-lg font-semibold text-gray-900">
                                Browse Templates
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Explore available poster layouts and choose one for your
                                occasion.
                            </p>
                        </Link>

                        <Link
                            href="/posters"
                            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-sm font-medium text-gray-500">Your work</p>

                            <h2 className="mt-2 text-lg font-semibold text-gray-900">
                                My Posters
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                View previously generated posters and manage your saved work.
                            </p>
                        </Link>

                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
                            <p className="text-sm font-medium text-gray-500">
                                AI workflow
                            </p>

                            <h2 className="mt-2 text-lg font-semibold text-gray-900">
                                Generate & Refine
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Generate a poster, preview the result and regenerate when you
                                need another version.
                            </p>
                        </div>
                    </section>

                    {/* Templates */}
                    <section className="mt-10">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-green-700">
                                    Start creating
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                    Available Templates
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Pick a layout and start building your poster.
                                </p>
                            </div>

                            <Link
                                href="/templates"
                                className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800"
                            >
                                View all templates →
                            </Link>
                        </div>

                        {loadingTemplates && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                                <p className="text-sm text-gray-500">
                                    Loading templates...
                                </p>
                            </div>
                        )}

                        {!loadingTemplates && templateError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                                <p className="text-sm text-red-600">{templateError}</p>
                            </div>
                        )}

                        {!loadingTemplates &&
                            !templateError &&
                            featuredTemplates.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                                    <p className="font-medium text-gray-800">
                                        No templates available
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Templates will appear here when they are available.
                                    </p>
                                </div>
                            )}

                        {!loadingTemplates &&
                            !templateError &&
                            featuredTemplates.length > 0 && (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {featuredTemplates.map((template) => (
                                        <Link
                                            key={template._id}
                                            href={`/posters/new?templateId=${template._id}`}
                                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <div className="overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={template.thumbnailUrl}
                                                    alt={template.title}
                                                    className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                />
                                            </div>

                                            <div className="p-4">
                                                <p className="font-semibold text-gray-900">
                                                    {template.title}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {template.occasionType}
                                                </p>

                                                <p className="mt-3 text-sm font-medium text-green-700">
                                                    Use this template →
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}