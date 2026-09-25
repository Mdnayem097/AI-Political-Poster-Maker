"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import type { Template } from "@/types";

interface UploadedPhoto {
    file: File;
    previewUrl: string;
    uploadedUrl?: string;
    uploading: boolean;
    error?: string;
}

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

    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [photoError, setPhotoError] = useState("");
    const [creatingPoster, setCreatingPoster] = useState(false);

    const [posterId, setPosterId] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<
        "draft" | "generating" | "completed" | "failed"
    >("draft");

    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
        null,
    );

    const [regenerating, setRegenerating] = useState(false);
    const [regenerationsLeft, setRegenerationsLeft] = useState<number | null>(
        null,
    );

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

    function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files ?? []);

        setPhotoError("");

        if (selectedFiles.length === 0) {
            return;
        }

        const remainingSlots = 3 - photos.length;

        if (remainingSlots <= 0) {
            setPhotoError("You can upload a maximum of 3 photos.");
            event.target.value = "";
            return;
        }

        const filesToAdd = selectedFiles.slice(0, remainingSlots);

        if (selectedFiles.length > remainingSlots) {
            setPhotoError(
                `You can upload a maximum of 3 photos. Only ${remainingSlots} photo${remainingSlots === 1 ? "" : "s"
                } was added.`,
            );
        }

        const newPhotos: UploadedPhoto[] = filesToAdd.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            uploading: false,
        }));

        setPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);

        event.target.value = "";
    }

    function removePhoto(index: number) {
        setPhotos((currentPhotos) => {
            const photoToRemove = currentPhotos[index];

            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.previewUrl);
            }

            return currentPhotos.filter((_, photoIndex) => photoIndex !== index);
        });

        setPhotoError("");
    }

    async function uploadPhoto(index: number) {
        const photo = photos[index];

        if (!photo || photo.uploadedUrl || photo.uploading) {
            return;
        }

        setPhotos((currentPhotos) =>
            currentPhotos.map((item, photoIndex) =>
                photoIndex === index
                    ? {
                        ...item,
                        uploading: true,
                        error: undefined,
                    }
                    : item,
            ),
        );

        try {
            const formData = new FormData();
            formData.append("image", photo.file);

            const res = await apiRequest<{ url: string }>("/api/upload", {
                method: "POST",
                body: formData,
            });

            setPhotos((currentPhotos) =>
                currentPhotos.map((item, photoIndex) =>
                    photoIndex === index
                        ? {
                            ...item,
                            uploading: false,
                            uploadedUrl: res.data.url,
                        }
                        : item,
                ),
            );
        } catch (err) {
            setPhotos((currentPhotos) =>
                currentPhotos.map((item, photoIndex) =>
                    photoIndex === index
                        ? {
                            ...item,
                            uploading: false,
                            error:
                                err instanceof Error
                                    ? err.message
                                    : "Could not upload this photo",
                        }
                        : item,
                ),
            );
        }
    }

    async function uploadAllPhotos() {
        const pendingIndexes = photos
            .map((photo, index) =>
                !photo.uploadedUrl && !photo.uploading ? index : -1,
            )
            .filter((index) => index !== -1);

        await Promise.all(pendingIndexes.map((index) => uploadPhoto(index)));
    }

    async function pollPosterStatus(createdPosterId: string) {
        const maxAttempts = 30;
        const intervalMs = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const res = await apiRequest<{
                    _id: string;
                    status: "draft" | "generating" | "completed" | "failed";
                    generatedImageUrl?: string;
                    regenerationsLeft?: number;
                }>(`/api/posters/${createdPosterId}`);

                const poster = res.data;

                if (typeof poster.regenerationsLeft === "number") {
                    setRegenerationsLeft(poster.regenerationsLeft);
                }

                setGenerationStatus(poster.status);

                if (poster.status === "completed") {
                    if (!poster.generatedImageUrl) {
                        throw new Error("Poster generation completed but image URL is missing");
                    }

                    setGeneratedImageUrl(poster.generatedImageUrl);

                    console.log("Poster generated:", poster.generatedImageUrl);

                    return;
                }

                if (poster.status === "failed") {
                    throw new Error("Poster generation failed");
                }
            } catch (err) {
                throw err;
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        throw new Error("Poster generation timed out");
    }

    async function handleRegenerate() {
        if (!posterId || regenerating || regenerationsLeft === 0) {
            return;
        }

        setError("");
        setRegenerating(true);
        setGenerationStatus("generating");
        setGeneratedImageUrl(null);

        try {
            await apiRequest(`/api/posters/${posterId}/regenerate`, {
                method: "POST",
            });

            console.log("Poster regeneration started:", posterId);

            await pollPosterStatus(posterId);

            console.log("Poster regeneration completed:", posterId);
        } catch (err) {
            setGenerationStatus("failed");

            setError(
                err instanceof Error
                    ? err.message
                    : "Could not regenerate poster",
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
            link.download = `poster-${posterId ?? "generated"}.png`;

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!templateId || !canContinue) {
            return;
        }

        setError("");
        setCreatingPoster(true);

        try {
            const uploadedPhotoUrls = photos
                .map((photo) => photo.uploadedUrl)
                .filter((url): url is string => Boolean(url));

            const createRes = await apiRequest<{ _id: string }>("/api/posters", {
                method: "POST",
                body: JSON.stringify({
                    templateId,
                    name,
                    designation,
                    partyOrOrganization,
                    unionThanaDistrict,
                    occasion,
                    headline,
                    uploadedPhotoUrls,
                }),
            });

            const createdPosterId = createRes.data._id;

            setPosterId(createdPosterId);
            setGenerationStatus("generating");

            console.log("Poster created:", createdPosterId);

            await apiRequest(`/api/posters/${createdPosterId}/generate`, {
                method: "POST",
            });

            console.log("Poster generation started:", createdPosterId);

            await pollPosterStatus(createdPosterId);

            console.log("Poster generation completed:", createdPosterId);

            alert("Poster generated successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not create or generate poster",
            );
        } finally {
            setCreatingPoster(false);
        }
    }

    const missingTemplateId = !templateId;

    const uploadedPhotoCount = photos.filter(
        (photo) => Boolean(photo.uploadedUrl),
    ).length;

    const uploadingPhoto = photos.some((photo) => photo.uploading);

    const canContinue =
        photos.length > 0 &&
        uploadedPhotoCount === photos.length &&
        !uploadingPhoto;

    return (
        <ProtectedRoute>
            <Navbar />

            <main className="min-h-[calc(100vh-57px)] bg-gray-50">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
                    {/* Page Header */}
                    <div className="mb-8">
                        <Link
                            href="/templates"
                            className="inline-flex items-center text-sm font-medium text-green-700 transition hover:text-green-800"
                        >
                            ← Back to templates
                        </Link>

                        <div className="mt-5">
                            <p className="text-sm font-semibold text-green-700">
                                Create your poster
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                                Add poster details
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                Enter the information you want to include in your poster.
                                Add up to three photos before generating the final design.
                            </p>
                        </div>
                    </div>

                    {/* No Template Selected */}
                    {missingTemplateId && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-semibold text-red-800">
                                No template selected
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-red-600">
                                Please choose a template before creating a poster.
                            </p>

                            <Link
                                href="/templates"
                                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Choose a template
                            </Link>
                        </section>
                    )}

                    {/* Template Loading */}
                    {!missingTemplateId && loadingTemplate && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-gray-200" />
                            <div className="mt-6 h-28 animate-pulse rounded-xl bg-gray-200" />
                        </div>
                    )}

                    {/* Template Error */}
                    {!missingTemplateId && !loadingTemplate && error && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-semibold text-red-800">
                                Unable to create poster
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-red-600">
                                {error}
                            </p>

                            <Link
                                href="/templates"
                                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Choose another template
                            </Link>
                        </section>
                    )}

                    {/* Main Create Poster Content */}
                    {!missingTemplateId &&
                        !loadingTemplate &&
                        !error &&
                        template && (
                            <div className="space-y-8">
                                {/* Selected Template */}
                                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                            Step 1
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-gray-900">
                                            Selected template
                                        </h2>
                                    </div>

                                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                                        <div className="w-full shrink-0 sm:w-32">
                                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={template.thumbnailUrl}
                                                    alt={template.title}
                                                    className="aspect-[3/4] w-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {template.title}
                                                </h3>

                                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                    {template.occasionType}
                                                </span>
                                            </div>

                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                                Your poster will be created using this layout.
                                                You can change the template before continuing.
                                            </p>

                                            <Link
                                                href="/templates"
                                                className="mt-4 inline-flex text-sm font-semibold text-green-700 transition hover:text-green-800"
                                            >
                                                Change template →
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                {/* Poster Information Form */}
                                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                            Step 2
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                                            Poster information
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Provide the details that should appear on your poster.
                                        </p>
                                    </div>

                                    <div className="p-5 sm:p-8">
                                        <form onSubmit={handleSubmit} className="space-y-7">
                                            {/* Basic Information */}
                                            <div className="space-y-5">
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
                                                            onChange={(event) =>
                                                                setName(event.target.value)
                                                            }
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
                                                                setPartyOrOrganization(
                                                                    event.target.value,
                                                                )
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
                                                                setUnionThanaDistrict(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="e.g. Baliadangi, Thakurgaon"
                                                            required
                                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                        />
                                                    </div>
                                                </div>

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
                                                        onChange={(event) =>
                                                            setOccasion(event.target.value)
                                                        }
                                                        placeholder="e.g. Victory Day, Tribute, Campaign"
                                                        required
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                    />
                                                </div>

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
                                                        onChange={(event) =>
                                                            setHeadline(event.target.value)
                                                        }
                                                        placeholder="Enter the main headline for your poster"
                                                        rows={4}
                                                        required
                                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                                    />

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Keep the headline short and clear for better
                                                        poster presentation.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Photo Upload */}
                                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            Poster photos
                                                        </p>

                                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                                                            Add up to 3 photos. They will be uploaded
                                                            securely before the poster is generated.
                                                        </p>
                                                    </div>

                                                    <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
                                                        {photos.length}/3 selected
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {photos.map((photo, index) => (
                                                        <div
                                                            key={`${photo.file.name}-${index}`}
                                                            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                                        >
                                                            <div className="relative aspect-square bg-gray-100">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={photo.previewUrl}
                                                                    alt={`Selected photo ${index + 1}`}
                                                                    className="h-full w-full object-cover"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePhoto(index)}
                                                                    className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-black"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>

                                                            <div className="p-3">
                                                                <p
                                                                    className="truncate text-xs font-medium text-gray-700"
                                                                    title={photo.file.name}
                                                                >
                                                                    {photo.file.name}
                                                                </p>

                                                                {photo.uploading && (
                                                                    <p className="mt-2 text-xs font-medium text-green-700">
                                                                        Uploading...
                                                                    </p>
                                                                )}

                                                                {photo.uploadedUrl &&
                                                                    !photo.uploading && (
                                                                        <p className="mt-2 text-xs font-medium text-green-700">
                                                                            Uploaded successfully
                                                                        </p>
                                                                    )}

                                                                {photo.error && !photo.uploading && (
                                                                    <div className="mt-2">
                                                                        <p className="text-xs leading-5 text-red-600">
                                                                            {photo.error}
                                                                        </p>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => uploadPhoto(index)}
                                                                            className="mt-2 text-xs font-semibold text-green-700 transition hover:text-green-800"
                                                                        >
                                                                            Try again
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {!photo.uploadedUrl &&
                                                                    !photo.uploading &&
                                                                    !photo.error && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                uploadPhoto(index)
                                                                            }
                                                                            className="mt-2 text-xs font-semibold text-green-700 transition hover:text-green-800"
                                                                        >
                                                                            Upload photo
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {photos.length < 3 && (
                                                        <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-5 text-center transition hover:border-green-500 hover:bg-green-50">
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                Add photo
                                                            </span>

                                                            <span className="mt-1 text-xs text-gray-500">
                                                                PNG, JPG, JPEG, WEBP
                                                            </span>

                                                            <span className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white">
                                                                Choose image
                                                            </span>

                                                            <input
                                                                type="file"
                                                                accept="image/png,image/jpeg,image/webp"
                                                                multiple
                                                                onChange={handlePhotoSelect}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    )}
                                                </div>

                                                {photoError && (
                                                    <p className="mt-3 text-sm leading-5 text-red-600">
                                                        {photoError}
                                                    </p>
                                                )}

                                                {photos.length > 0 && (
                                                    <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
                                                        <button
                                                            type="button"
                                                            onClick={uploadAllPhotos}
                                                            disabled={
                                                                uploadingPhoto || canContinue
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {uploadingPhoto
                                                                ? "Uploading..."
                                                                : canContinue
                                                                    ? "All photos uploaded"
                                                                    : "Upload all photos"}
                                                        </button>

                                                        <p className="text-xs text-gray-500">
                                                            {uploadedPhotoCount} of {photos.length}{" "}
                                                            uploaded
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Form Actions */}
                                            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                                                <Link
                                                    href="/templates"
                                                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </Link>

                                                <button
                                                    type="submit"
                                                    disabled={!canContinue || creatingPoster}
                                                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {creatingPoster
                                                        ? "Generating poster..."
                                                        : "Generate Poster"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </section>

                                {/* Generated Poster Result */}
                                {(generatedImageUrl || creatingPoster || regenerating) && (
                                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                                Step 3
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-gray-900">
                                                {generatedImageUrl
                                                    ? "Your poster is ready"
                                                    : regenerating
                                                        ? "Creating a new version"
                                                        : "Generating your poster"}
                                            </h2>

                                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                                {generatedImageUrl
                                                    ? "Review your generated poster and download it when you are ready."
                                                    : "This may take a few moments. Please keep this page open."}
                                            </p>
                                        </div>

                                        <div className="bg-gray-100 p-5 sm:p-8">
                                            {generatedImageUrl ? (
                                                <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-md">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={generatedImageUrl}
                                                        alt="Generated poster"
                                                        className="h-auto w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-white">
                                                    <div className="text-center">
                                                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

                                                        <p className="mt-4 text-sm font-semibold text-gray-800">
                                                            {regenerating
                                                                ? "Regenerating your poster..."
                                                                : "Generating your poster..."}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            This may take a few moments.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {generatedImageUrl && (
                                            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                                                <button
                                                    type="button"
                                                    onClick={handleDownload}
                                                    disabled={regenerating}
                                                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Download Poster
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleRegenerate}
                                                    disabled={
                                                        regenerating ||
                                                        regenerationsLeft === 0 ||
                                                        !posterId
                                                    }
                                                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {regenerating
                                                        ? "Regenerating..."
                                                        : "Regenerate Poster"}
                                                </button>
                                            </div>
                                        )}

                                        {regenerationsLeft !== null && (
                                            <div className="border-t border-gray-100 px-5 py-4 text-center">
                                                <p className="text-xs text-gray-500">
                                                    {regenerationsLeft} regeneration
                                                    {regenerationsLeft === 1 ? "" : "s"} remaining
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </div>
                        )}
                </div>
            </main>
        </ProtectedRoute>
    );
}