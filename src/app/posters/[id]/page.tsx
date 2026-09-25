"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Poster } from "@/types";

export default function PosterDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const posterId = typeof params.id === "string" ? params.id : "";

    const [poster, setPoster] = useState<Poster | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
        null,
    );
    const [regenerationsLeft, setRegenerationsLeft] = useState<number | null>(
        null,
    );
    const [regenerating, setRegenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!posterId) {
            return;
        }

        apiRequest<Poster & { regenerationsLeft?: number }>(
            `/api/posters/${posterId}`,
        )
            .then((res) => {
                setPoster(res.data);
                setGeneratedImageUrl(res.data.generatedImageUrl ?? null);

                if (typeof res.data.regenerationsLeft === "number") {
                    setRegenerationsLeft(res.data.regenerationsLeft);
                }
            })
            .catch((err) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Could not load poster",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [posterId]);

    async function pollPosterStatus() {
        const maxAttempts = 30;
        const intervalMs = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const res = await apiRequest<
                Poster & { regenerationsLeft?: number }
            >(`/api/posters/${posterId}`);

            const updatedPoster = res.data;

            setPoster(updatedPoster);

            if (typeof updatedPoster.regenerationsLeft === "number") {
                setRegenerationsLeft(updatedPoster.regenerationsLeft);
            }

            if (updatedPoster.status === "completed") {
                if (!updatedPoster.generatedImageUrl) {
                    throw new Error(
                        "Poster generation completed but image URL is missing",
                    );
                }

                setGeneratedImageUrl(updatedPoster.generatedImageUrl);

                return;
            }

            if (updatedPoster.status === "failed") {
                throw new Error("Poster regeneration failed");
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        throw new Error("Poster regeneration timed out");
    }

    async function handleRegenerate() {
        if (
            !posterId ||
            regenerating ||
            regenerationsLeft === 0
        ) {
            return;
        }

        setError("");
        setRegenerating(true);
        setGeneratedImageUrl(null);

        setPoster((currentPoster) =>
            currentPoster
                ? {
                    ...currentPoster,
                    status: "generating",
                }
                : currentPoster,
        );

        try {
            await apiRequest(`/api/posters/${posterId}/regenerate`, {
                method: "POST",
            });

            await pollPosterStatus();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not regenerate poster",
            );

            setPoster((currentPoster) =>
                currentPoster
                    ? {
                        ...currentPoster,
                        status: "failed",
                    }
                    : currentPoster,
            );
        } finally {
            setRegenerating(false);
        }
    }

    async function handleDownload() {
        if (!generatedImageUrl) {
            return;
        }

        try {
            const response = await fetch(generatedImageUrl);

            if (!response.ok) {
                throw new Error("Could not download poster");
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `poster-${posterId}.png`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not download poster",
            );
        }
    }

    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-semibold text-green-700 transition hover:text-green-800"
                        >
                            ← Back to My Posters
                        </button>
                    </div>

                    {loading && (
                        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <div className="aspect-[3/4] animate-pulse bg-gray-200" />
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                                <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
                                <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-gray-200" />

                                <div className="mt-8 space-y-4">
                                    <div className="h-12 animate-pulse rounded bg-gray-200" />
                                    <div className="h-12 animate-pulse rounded bg-gray-200" />
                                    <div className="h-12 animate-pulse rounded bg-gray-200" />
                                </div>
                            </div>
                        </section>
                    )}

                    {!loading && error && !poster && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h1 className="font-semibold text-red-800">
                                Could not load poster
                            </h1>

                            <p className="mt-1 text-sm text-red-600">{error}</p>

                            <Link
                                href="/posters"
                                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Back to My Posters
                            </Link>
                        </section>
                    )}

                    {!loading && poster && (
                        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-6 py-5">
                                    <p className="text-sm font-medium text-green-700">
                                        Poster preview
                                    </p>

                                    <h1 className="mt-1 text-xl font-bold text-gray-900">
                                        {poster.formData.name}
                                    </h1>
                                </div>

                                <div className="bg-gray-100 p-5 sm:p-8">
                                    {generatedImageUrl ? (
                                        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-md">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={generatedImageUrl}
                                                alt={`Generated poster for ${poster.formData.name}`}
                                                className="h-auto w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white">
                                            <div className="text-center">
                                                {regenerating ? (
                                                    <>
                                                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

                                                        <p className="mt-4 text-sm font-medium text-gray-700">
                                                            Regenerating your poster...
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            This may take a few moments.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-500">
                                                        Poster preview is not available.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="border-t border-red-100 bg-red-50 px-6 py-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row">
                                    {generatedImageUrl && (
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            disabled={regenerating}
                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Download Poster
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleRegenerate}
                                        disabled={
                                            regenerating ||
                                            regenerationsLeft === 0 ||
                                            !posterId
                                        }
                                        className="flex-1 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {regenerating
                                            ? "Regenerating..."
                                            : "Regenerate Poster"}
                                    </button>
                                </div>

                                {regenerationsLeft !== null && (
                                    <div className="border-t border-gray-100 px-6 py-4 text-center">
                                        <p className="text-xs text-gray-500">
                                            {regenerationsLeft} regeneration
                                            {regenerationsLeft === 1 ? "" : "s"} remaining
                                        </p>
                                    </div>
                                )}
                            </div>

                            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-green-700">
                                            Poster details
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                                            {poster.formData.name}
                                        </h2>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${poster.status === "completed"
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

                                <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Designation
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {poster.formData.designation}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Party / Organization
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {poster.formData.partyOrOrganization}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Area
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {poster.formData.unionThanaDistrict}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Occasion
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {poster.formData.occasion}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Headline
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-gray-800">
                                            {poster.formData.headline}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {new Date(poster.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/posters"
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Back to My Posters
                                </Link>
                            </aside>
                        </section>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}