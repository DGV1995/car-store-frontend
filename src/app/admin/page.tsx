"use client";

import { useState, useRef, useCallback } from "react";
import { createCar, ApiValidationError } from "@/lib/api";
import type { CarFormErrors } from "@/types";

/** Maximum year allowed (current year + 1). */
const MAX_YEAR = new Date().getFullYear() + 1;
/** Minimum year allowed per the backend model. */
const MIN_YEAR = 1886;

/** Allowed image MIME types for upload. */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.gif";

/** Validate all form fields, returning errors keyed by field. */
function validateForm(
  image: File | null,
  brand: string,
  model: string,
  year: string,
  price: string,
): CarFormErrors {
  const errors: CarFormErrors = {};

  // Image is required.
  if (!image) {
    errors.image = "An image is required.";
  } else if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    errors.image = "Only JPG, PNG, and GIF images are accepted.";
  }

  if (!brand.trim()) {
    errors.brand = "Brand is required.";
  }

  if (!model.trim()) {
    errors.model = "Model is required.";
  }

  if (!year.trim()) {
    errors.year = "Year is required.";
  } else {
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum)) {
      errors.year = "Year must be a whole number.";
    } else if (yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      errors.year = `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`;
    }
  }

  if (!price.trim()) {
    errors.price = "Price is required.";
  } else {
    const priceNum = Number(price);
    if (Number.isNaN(priceNum)) {
      errors.price = "Price must be a valid number.";
    } else if (priceNum <= 0) {
      errors.price = "Price must be a positive number.";
    }
  }

  return errors;
}

export default function AdminPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Handle image file selection with preview. */
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setErrors((prev) => ({ ...prev, image: undefined }));

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  /** Remove the selected image. */
  const handleRemoveImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
  }, []);

  /** Clear entire form and reset state. */
  const resetForm = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setBrand("");
    setModel("");
    setYear("");
    setPrice("");
    setErrors({});
    setServerError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  /** Handle form submission. */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);
      setSuccessMessage(null);

      const validationErrors = validateForm(image, brand, model, year, price);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setLoading(true);

      try {
        await createCar(image, brand.trim(), model.trim(), Number(year), Number(price));
        setSuccessMessage("Car added successfully!");
        // Clear form after a brief delay so the user can see the success message.
        setTimeout(() => {
          resetForm();
          setSuccessMessage(null);
        }, 3000);
      } catch (err) {
        if (err instanceof ApiValidationError) {
          // If the API returned structured field-level errors, display them inline.
          if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
            setErrors(err.fieldErrors);
          } else {
            setServerError(err.message);
          }
        } else if (err instanceof Error) {
          setServerError(err.message);
        } else {
          setServerError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    },
    [image, brand, model, year, price, resetForm],
  );

  /** Whether the form has any non-empty field (for display purposes). */
  const isPristine =
    !image && !brand.trim() && !model.trim() && !year.trim() && !price.trim();

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Add a Car
        </h1>
        <p className="mt-1 text-zinc-500">
          Fill in the details below to add a new car to the store.
        </p>
      </header>

      {/* Success toast */}
      {successMessage && (
        <div className="mb-6 animate-fade-in rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm">
          <div className="flex items-center gap-2">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {successMessage}
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
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {serverError}
          </div>
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl bg-white p-6 shadow-md sm:p-8"
      >
        <div className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Car Image <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Car preview"
                  className="h-48 w-72 rounded-xl object-cover shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow transition-colors hover:bg-red-600"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50">
                <svg
                  className="mb-2 h-10 w-10 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm font-medium text-zinc-600">
                  Click to upload an image
                </span>
                <span className="mt-1 text-xs text-zinc-400">
                  {ALLOWED_EXTENSIONS}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS}
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            )}
            {errors.image && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.image}
              </p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="brand"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              id="brand"
              type="text"
              placeholder="e.g. Toyota"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                if (errors.brand) setErrors((prev) => ({ ...prev, brand: undefined }));
              }}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.brand
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.brand && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.brand}
              </p>
            )}
          </div>

          {/* Model */}
          <div>
            <label
              htmlFor="model"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="model"
              type="text"
              placeholder="e.g. Corolla"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }));
              }}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.model
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.model && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.model}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Year <span className="text-red-500">*</span>
            </label>
            <input
              id="year"
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              placeholder={`e.g. ${new Date().getFullYear()}`}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
              }}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.year
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {errors.year && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.year}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                $
              </span>
              <input
                id="price"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                className={`w-full rounded-lg border bg-white py-2.5 pl-7 pr-3 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                  errors.price
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-zinc-300 focus:border-primary-500 focus:ring-primary-200"
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Adding…
                </>
              ) : (
                "Add Car"
              )}
            </button>

            {!isPristine && !loading && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
