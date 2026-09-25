"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Poster } from "@/types";

export default function PostersPage() {
    const [posters, setPosters] = useState<Poster[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function handleDelete(posterId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this poster?",
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setDeletingId(posterId);

        try {
            await apiRequest(`/api/posters/${posterId}`, {
                method: "DELETE",
            });

            setPosters((currentPosters) =>
                currentPosters.filter((poster) => poster._id !== posterId),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not delete poster",
            );
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        apiRequest<Poster[]>("/api/posters")
            .then((res) => {
                setPosters(res.data);
            })
            .catch((err) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Could not load your posters",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <section className="mb-8">
                        <p className="text-sm font-medium text-green-700">
                            Your work
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                            My Posters
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                            View the posters you have created with AI Poster Maker.
                        </p>
                    </section>

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
                                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {!loading && error && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-semibold text-red-800">
                                Could not load posters
                            </h2>

                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        </section>
                    )}

                    {!loading && !error && posters.length === 0 && (
                        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                            <div className="mx-auto max-w-md">
                                <p className="text-sm font-medium text-green-700">
                                    Nothing here yet
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-gray-900">
                                    Create your first poster
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Choose a template, add your details and photos, and generate
                                    your first poster.
                                </p>

                                <Link
                                    href="/templates"
                                    className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                                >
                                    Create New Poster
                                </Link>
                            </div>
                        </section>
                    )}

                    {!loading && !error && posters.length > 0 && (
                        <section>
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {posters.length}{" "}
                                    {posters.length === 1 ? "poster" : "posters"} created
                                </p>

                                <Link
                                    href="/templates"
                                    className="text-sm font-semibold text-green-700 transition hover:text-green-800"
                                >
                                    Create New Poster →
                                </Link>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {posters.map((poster) => (
                                    <article
                                        key={poster._id}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <div className="relative bg-gray-100">
                                            {poster.generatedImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={poster.generatedImageUrl}
                                                    alt={`Poster for ${poster.formData.name}`}
                                                    className="aspect-[3/4] w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex aspect-[3/4] items-center justify-center">
                                                    <p className="px-6 text-center text-sm text-gray-500">
                                                        Poster preview is not available yet.
                                                    </p>
                                                </div>
                                            )}

                                            <span
                                                className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${poster.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : poster.status === "failed"
                                                        ? "bg-red-100 text-red-700"
                                                        : poster.status === "generating"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {poster.status}
                                            </span>
                                        </div>

                                        <div className="p-5">
                                            <h2 className="font-semibold text-gray-900">
                                                {poster.formData.name}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {poster.formData.designation}
                                            </p>

                                            <p className="mt-3 text-sm text-gray-600">
                                                {poster.formData.occasion}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Created{" "}
                                                {new Date(poster.createdAt).toLocaleDateString()}
                                            </p>

                                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                                                <Link
                                                    href={`/posters/${poster._id}`}
                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    View Poster
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(poster._id)}
                                                    disabled={deletingId === poster._id}
                                                    className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingId === poster._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}