"use client";

import { FormEvent, useState } from "react";

import { ApiError, apiClient } from "@digit-auth/react";
import { useAuth } from "@digit-auth/react";

type UpdateProfileResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    setIsSaving(true);

    try {
      await apiClient.patch<UpdateProfileResponse>("/profile", {
        firstName,
        lastName,
      });

      await refreshUser();

      setSuccess("Your profile has been updated successfully.");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Unable to update your profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");

    setError("");
    setSuccess("");
    setIsEditing(false);
  }

  return (
    <div className="p-6 lg:p-8">
      <section>
        <p className="text-sm font-medium text-zinc-500">Account</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
          Profile
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Manage your personal information and account details.
        </p>
      </section>

      <section className="mt-8 max-w-3xl rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-base font-semibold text-zinc-950">
            Personal information
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Update the name associated with your DigitAuth account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {success}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-zinc-900"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={!isEditing || isSaving}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={!isEditing || isSaving}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-900"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Your email address is used for authentication and cannot be
                changed here.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-900">
                Email verification
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    user?.emailVerified ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />

                <span className="text-sm text-zinc-600">
                  {user?.emailVerified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setIsEditing(true);
                }}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Edit profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
