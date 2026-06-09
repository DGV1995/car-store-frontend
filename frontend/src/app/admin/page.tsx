"use client";

import { useState, useRef, useCallback } from "react";
import type { CarFormErrors } from "@/types";
import { createCar } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.gif";
const MAX_YEAR = new Date().getFullYear() + 1;
const MIN_YEAR = 1886;

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */

function validateForm(
  image: File | null,
  brand: string,
  model: string,
  year: string,
  price: string,
): CarFormErrors {
  const errors: CarFormErrors = {};

  if (!image) {
    errors.image = "Please select an image.";
  }

  if (!brand.trim()) {
    errors.brand = "Brand is required.";
  }

  if (!model.trim()) {
    errors.model = "Model is required.";
  }

  const yearNum = Number(year);
  if (!year) {
    errors.year = "Year is required.";
  } else if (!Number.isInteger(yearNum)) {
    errors.year = "Year must be a whole number.";
  } else if (yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
    errors.year = `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`;
  }

  const priceNum = Number(price);
  if (!price) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = "Price must be a positive number.";
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  /* ---- state ---- */
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");

  const [errors, setErrors] = useState<CarFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- image handling ---- */
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // Clear previous preview URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear the image error if user picks a file
      setErrors((prev) => ({ ...prev, image: undefined }));
    } else {
      setImage(null);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  /* ---- submit ---- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSuccessMessage(null);
      setServerError(null);

      const validationErrors = validateForm(image, brand, model, year, price);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setSubmitting(true);

      try {
        await createCar(image, brand.trim(), model.trim(), Number(year), Number(price));

        // Success – reset form
        setSuccessMessage("Car added successfully!");
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImage(null);
        setPreviewUrl(null);
        setBrand("");
        setModel("");
        setYear("");
        setPrice("");
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Auto-dismiss success after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setServerError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [image, brand, model, year, price, previewUrl],
  );

  /* ---- derived ---- */
  const hasErrors = Object.keys(errors).length > 0;

  /* ---- render ---- */
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Admin
        </h1>
        <p className="mt-1 text-zinc-500">Add a new car to the store.</p>
      </header>

      {/* Success toast */}
      {successMessage && (
        <div className="mb-6 animate-fade-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-emerald-600 hover:text-emerald-800"
              aria-label="Dismiss success message"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div className="mb-6 animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span>{serverError}</span>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
              aria-label="Dismiss error message"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl bg-white p-6 shadow-md sm:p-8"
      >
        <div className="space-y-6">
          {/* ======== Image upload ======== */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Car Image
            </label>

            {previewUrl ? (
              <div className="relative mb-3 overflow-hidden rounded-xl border border-zinc-200">
                <img
                  src={previewUrl}
                  alt="Car preview"
                  className="h-56 w-full object-cover sm:h-64"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  aria-label="Remove image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="mb-2 h-10 w-10 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="text-sm font-medium text-zinc-600">
                  Click to upload an image
                </p>
                <p className="mt-1 text-xs text-zinc-400">JPG, PNG or GIF</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleImageChange}
              className="hidden"
            />

            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* ======== Brand ======== */}
          <div>
            <label
              htmlFor="admin-brand"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Brand
            </label>
            <input
              id="admin-brand"
              type="text"
              placeholder="e.g. Toyota"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                if (errors.brand) setErrors((prev) => ({ ...prev, brand: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.brand
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
            )}
          </div>

          {/* ======== Model ======== */}
          <div>
            <label
              htmlFor="admin-model"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Model
            </label>
            <input
              id="admin-model"
              type="text"
              placeholder="e.g. Camry"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.model
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>

          {/* ======== Year ======== */}
          <div>
            <label
              htmlFor="admin-year"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Year
            </label>
            <input
              id="admin-year"
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              placeholder={`e.g. 2024 (${MIN_YEAR}–${MAX_YEAR})`}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.year
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
          </div>

          {/* ======== Price ======== */}
          <div>
            <label
              htmlFor="admin-price"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Price ($)
            </label>
            <input
              id="admin-price"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 25000"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.price
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* ======== Summary error ======== */}
          {hasErrors && !serverError && (
            <p className="text-xs text-red-500">
              Please fix the errors above before submitting.
            </p>
          )}

          {/* ======== Submit ======== */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {submitting ? "Adding Car…" : "Add Car"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
