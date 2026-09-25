"use client";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-10">
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
                            <p className="text-sm font-medium text-gray-500">AI workflow</p>

                            <h2 className="mt-2 text-lg font-semibold text-gray-900">
                                Generate & Refine
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Generate a poster, preview the result and regenerate when you
                                need another version.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}