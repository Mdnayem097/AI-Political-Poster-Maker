"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Template } from "@/types";

export default function CreatePosterPage() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");

    const [template, setTemplate] = useState<Template | null>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [partyOrOrganization, setPartyOrOrganization] = useState("");
    const [unionThanaDistrict, setUnionThanaDistrict] = useState("");
    const [occasion, setOccasion] = useState("");
    const [headline, setHeadline] = useState("");

    useEffect(() => {
        if (!templateId) {
            return;
        }

        apiRequest<Template[]>("/api/templates")
            .then((res) => {
                const selectedTemplate = res.data.find(
                    (item) => item._id === templateId,
                );

                if (!selectedTemplate) {
                    setError("The selected template could not be found.");
                    setLoadingTemplate(false);
                    return;
                }

                setTemplate(selectedTemplate);
                setLoadingTemplate(false);
            })
            .catch((err) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Could not load the selected template",
                );
                setLoadingTemplate(false);
            });
    }, [templateId]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        console.log({
            templateId,
            name,
            designation,
            partyOrOrganization,
            unionThanaDistrict,
            occasion,
            headline,
        });
    }

    const missingTemplateId = !templateId;

    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    {/* Page header */}
                    <div className="mb-8">
                        <Link
                            href="/templates"
                            className="text-sm font-medium text-green-700 hover:text-green-800"
                        >
                            ← Back to templates
                        </Link>

                        <p className="mt-5 text-sm font-medium text-green-700">
                            Create your poster
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                            Add poster details
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                            Enter the information you want to include in your poster. You
                            will be able to upload photos and generate the final design in
                            the next step.
                        </p>
                    </div>

                    {/* Missing template */}
                    {missingTemplateId && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-semibold text-red-800">
                                No template selected
                            </h2>

                            <p className="mt-1 text-sm text-red-600">
                                Please choose a template before creating a poster.
                            </p>

                            <Link
                                href="/templates"
                                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                            >
                                Choose a template
                            </Link>
                        </section>
                    )}

                    {/* Loading */}
                    {!missingTemplateId && loadingTemplate && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-8">
                            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
                        </div>
                    )}

                    {/* Error */}
                    {!missingTemplateId && !loadingTemplate && error && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-semibold text-red-800">
                                Unable to create poster
                            </h2>

                            <p className="mt-1 text-sm text-red-600">{error}</p>

                            <Link
                                href="/templates"
                                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                            >
                                Choose another template
                            </Link>
                        </section>
                    )}

                    {/* Main content */}
                    {!missingTemplateId &&
                        !loadingTemplate &&
                        !error &&
                        template && (
                            <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                                {/* Selected template */}
                                <aside>
                                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <div className="relative bg-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={template.thumbnailUrl}
                                                alt={template.title}
                                                className="aspect-[3/4] w-full object-cover"
                                            />

                                            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                                                {template.occasionType}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Selected template
                                            </p>

                                            <h2 className="mt-1 text-lg font-semibold text-gray-900">
                                                {template.title}
                                            </h2>

                                            <p className="mt-2 text-sm leading-5 text-gray-500">
                                                Your poster will be created using this layout.
                                            </p>

                                            <Link
                                                href="/templates"
                                                className="mt-4 inline-block text-sm font-semibold text-green-700 hover:text-green-800"
                                            >
                                                Change template
                                            </Link>
                                        </div>
                                    </div>
                                </aside>

                                {/* Form */}
                                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                                    <div className="mb-7">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Poster information
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Provide the details that should appear on your poster.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name + Designation */}
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="mb-2 block text-sm font-medium text-gray-700"
                                                >
                                                    Name
                                                </label>

                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(event) => setName(event.target.value)}
                                                    placeholder="Enter person's name"
                                                    required
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="designation"
                                                    className="mb-2 block text-sm font-medium text-gray-700"
                                                >
                                                    Designation
                                                </label>

                                                <input
                                                    id="designation"
                                                    type="text"
                                                    value={designation}
                                                    onChange={(event) =>
                                                        setDesignation(event.target.value)
                                                    }
                                                    placeholder="e.g. President, Chairman"
                                                    required
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                />
                                            </div>
                                        </div>

                                        {/* Party + Location */}
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="party"
                                                    className="mb-2 block text-sm font-medium text-gray-700"
                                                >
                                                    Party / Organization
                                                </label>

                                                <input
                                                    id="party"
                                                    type="text"
                                                    value={partyOrOrganization}
                                                    onChange={(event) =>
                                                        setPartyOrOrganization(event.target.value)
                                                    }
                                                    placeholder="Enter party or organization"
                                                    required
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="location"
                                                    className="mb-2 block text-sm font-medium text-gray-700"
                                                >
                                                    Union / Thana / District
                                                </label>

                                                <input
                                                    id="location"
                                                    type="text"
                                                    value={unionThanaDistrict}
                                                    onChange={(event) =>
                                                        setUnionThanaDistrict(event.target.value)
                                                    }
                                                    placeholder="e.g. Baliadangi, Thakurgaon"
                                                    required
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                />
                                            </div>
                                        </div>

                                        {/* Occasion */}
                                        <div>
                                            <label
                                                htmlFor="occasion"
                                                className="mb-2 block text-sm font-medium text-gray-700"
                                            >
                                                Occasion
                                            </label>

                                            <input
                                                id="occasion"
                                                type="text"
                                                value={occasion}
                                                onChange={(event) => setOccasion(event.target.value)}
                                                placeholder="e.g. Victory Day, Tribute, Campaign"
                                                required
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>

                                        {/* Headline */}
                                        <div>
                                            <label
                                                htmlFor="headline"
                                                className="mb-2 block text-sm font-medium text-gray-700"
                                            >
                                                Headline
                                            </label>

                                            <textarea
                                                id="headline"
                                                value={headline}
                                                onChange={(event) => setHeadline(event.target.value)}
                                                placeholder="Enter the main headline for your poster"
                                                rows={4}
                                                required
                                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            />

                                            <p className="mt-2 text-xs text-gray-500">
                                                Keep the headline short and clear for better poster
                                                presentation.
                                            </p>
                                        </div>

                                        {/* Photo placeholder */}
                                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                                            <p className="text-sm font-semibold text-gray-800">
                                                Photos
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Photo upload will be added in the next step.
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                                            <Link
                                                href="/templates"
                                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Link>

                                            <button
                                                type="submit"
                                                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                                            >
                                                Continue to Photos
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        )}
                </div>
            </main>
        </ProtectedRoute>
    );
}