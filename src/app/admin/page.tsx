'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { apiUrl } from '@/lib/api';
import type { CarResponse } from '@/types';

/** Accepted image MIME types */
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Human-readable label for accepted formats */
const ACCEPTED_FORMATS_LABEL = 'JPG, PNG, WebP';

export default function AdminPage() {
  const router = useRouter();

  /* ───── form state ───── */
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [km, setKm] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* ───── UI state ───── */
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ───── Handlers ───── */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // Clear previous preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        `Invalid image type. Accepted formats: ${ACCEPTED_FORMATS_LABEL}.`
      );
      setImageFile(null);
      setImagePreview(null);
      // Reset the file input so the user can pick again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Clear any previous type error
    setErrorMessage(null);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setYear('');
    setKm('');
    setPrice('');
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous feedback
    setSuccessMessage(null);
    setErrorMessage(null);

    // ---- Client-side validation ----

    if (!brand.trim()) {
      setErrorMessage('Brand is required.');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('Model is required.');
      return;
    }

    const yearNum = Number(year);
    if (!year || !Number.isInteger(yearNum) || yearNum < 1886) {
      setErrorMessage('Year must be a valid integer >= 1886.');
      return;
    }
    const currentYear = new Date().getFullYear();
    if (yearNum > currentYear) {
      setErrorMessage(`Year must not exceed the current year (${currentYear}).`);
      return;
    }

    const kmNum = Number(km);
    if (!km || !Number.isInteger(kmNum) || kmNum < 0) {
      setErrorMessage('Kilometres must be a non-negative integer.');
      return;
    }

    const priceNum = Number(price);
    if (price === '' || isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Price must be a non-negative number.');
      return;
    }

    if (!imageFile) {
      setErrorMessage('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    // ---- Build FormData ----

    const formData = new FormData();
    formData.append('brand', brand.trim());
    formData.append('model', model.trim());
    formData.append('year', String(yearNum));
    formData.append('km', String(kmNum));
    formData.append('price', String(priceNum));
    formData.append('image', imageFile);

    // ---- POST ----

    setSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/cars'), {
        method: 'POST',
        // Do NOT set Content-Type — the browser sets it with the
        // correct multipart/form-data boundary automatically.
        body: formData,
      });

      if (!response.ok) {
        // Try to extract a descriptive message from the backend
        let detail = `Request failed with status ${response.status}`;
        try {
          const errorBody = await response.json();
          if (typeof errorBody.detail === 'string') {
            detail = errorBody.detail;
          } else if (typeof errorBody.message === 'string') {
            detail = errorBody.message;
          }
        } catch {
          // Response body is not JSON — use the default message
        }
        throw new Error(detail);
      }

      const data: CarResponse = await response.json();

      setSuccessMessage(
        `Car “${data.car.brand} ${data.car.model}” (${data.car.year}) created successfully!`
      );
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Panel
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new car to the store
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success feedback */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error feedback */}
        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6"
        >
          {/* Brand & Model — row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Brand
              </label>
              <input
                id="brand"
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Toyota"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model
              </label>
              <input
                id="model"
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Corolla"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Year, Km, Price — row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year
              </label>
              <input
                id="year"
                type="number"
                required
                min={1886}
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2022"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Km */}
            <div>
              <label
                htmlFor="km"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kilometres
              </label>
              <input
                id="km"
                type="number"
                required
                min={0}
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="e.g. 45000"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (€)
              </label>
              <input
                id="price"
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 18500"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Car Image
            </label>
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: {ACCEPTED_FORMATS_LABEL}
            </p>

            {/* Image preview */}
            {imagePreview && (
              <div className="mt-3 rounded-md overflow-hidden border border-gray-200 w-full max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Car image preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Adding Car…
                </>
              ) : (
                'Add Car'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
