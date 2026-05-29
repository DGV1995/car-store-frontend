"use client";

import { useState, useRef, FormEvent } from "react";
import { createCar, ValidationError } from "@/lib/api";
import Link from "next/link";

interface FormDataState {
  brand: string;
  model: string;
  year: string;
  price: string;
  image: File | null;
}

interface FieldErrors {
  brand?: string;
  model?: string;
  year?: string;
  price?: string;
  image?: string;
  __global__?: string;
}

const initialFormData: FormDataState = {
  brand: "",
  model: "",
  year: "",
  price: "",
  image: null,
};

export default function AdminPage() {
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FieldErrors];
        return next;
      });
    }
    if (successMessage) setSuccessMessage(null);
    if (globalError) setGlobalError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, image: file }));
    if (fieldErrors.image) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
    if (successMessage) setSuccessMessage(null);
    if (globalError) setGlobalError(null);
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.image) {
      errors.image = "Please select an image file.";
    }
    if (!formData.brand.trim()) {
      errors.brand = "Brand is required.";
    }
    if (!formData.model.trim()) {
      errors.model = "Model is required.";
    }
    if (!formData.year.trim()) {
      errors.year = "Year is required.";
    } else {
      const yearNum = Number(formData.year);
      if (!Number.isInteger(yearNum) || yearNum < 1886 || yearNum > new Date().getFullYear() + 1) {
        errors.year = `Year must be between 1886 and ${new Date().getFullYear() + 1}.`;
      }
    }
    if (!formData.price.trim()) {
      errors.price = "Price is required.";
    } else {
      const priceNum = Number(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.price = "Price must be a positive number.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFieldErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setGlobalError(null);

    if (!validateForm()) return;

    // TypeScript narrow: image is non-null after validateForm passes
    const imageFile = formData.image as File;

    setSubmitting(true);

    try {
      await createCar({
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        image: imageFile,
      });

      setSuccessMessage("Car added successfully!");
      resetForm();
    } catch (err: unknown) {
      if (Array.isArray(err)) {
        // Validation errors from the API
        const validationErrors = err as ValidationError[];
        const mapped: FieldErrors = {};
        for (const ve of validationErrors) {
          if (ve.field === "__global__") {
            mapped.__global__ = ve.message;
          } else {
            // Map API field names to form field names
            const key = ve.field as keyof FieldErrors;
            // If the API error mentions "image" or "file", map to image
            if (key === "image" || key === "file" || key === "upload_file") {
              mapped.image = ve.message;
            } else if (key in mapped) {
              // Multiple errors for same field — append
              mapped[key] = `${mapped[key]}; ${ve.message}`;
            } else {
              mapped[key] = ve.message;
            }
          }
        }
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
      } else if (err instanceof Error) {
        setGlobalError(err.message);
      } else {
        setGlobalError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) => {
    const base =
      "w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2";
    return fieldErrors[field]
      ? `${base} border-red-400 focus:border-red-500 focus:ring-red-500/20`
      : `${base} border-gray-300 focus:border-blue-500 focus:ring-blue-500/20`;
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-500">Add a new car listing</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-95"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Form content */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            New Car
          </h2>

          {/* Success message */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Global error message */}
          {globalError && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Image upload */}
            <div>
              <label htmlFor="image" className={labelClass}>
                Image File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={submitting}
                className={`w-full rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200 ${
                  fieldErrors.image
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                } focus:outline-none focus:ring-2`}
              />
              {fieldErrors.image && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.image}
                </p>
              )}
              {formData.image && !fieldErrors.image && (
                <p className="mt-1 text-xs text-gray-400">
                  {formData.image.name} ({(formData.image.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className={labelClass}>
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleTextChange}
                placeholder="e.g., Toyota, BMW"
                disabled={submitting}
                className={inputClass("brand")}
              />
              {fieldErrors.brand && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.brand}
                </p>
              )}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className={labelClass}>
                Model <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleTextChange}
                placeholder="e.g., Camry, X5"
                disabled={submitting}
                className={inputClass("model")}
              />
              {fieldErrors.model && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.model}
                </p>
              )}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className={labelClass}>
                Year <span className="text-red-500">*</span>
              </label>
              <input
                id="year"
                name="year"
                type="number"
                min="1886"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleTextChange}
                placeholder="e.g., 2024"
                disabled={submitting}
                className={inputClass("year")}
              />
              {fieldErrors.year && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.year}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className={labelClass}>
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleTextChange}
                placeholder="e.g., 45000"
                disabled={submitting}
                className={inputClass("price")}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.price}
                </p>
              )}
            </div>

            {/* Global validation error (from API) */}
            {fieldErrors.__global__ && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {fieldErrors.__global__}
              </div>
            )}

            {/* Submit button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
                  submitting
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {submitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {submitting ? "Adding Car…" : "Add Car"}
              </button>
              {!submitting && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-95"
                >
                  Clear All
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Car Store. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
