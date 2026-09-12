"use client";

import { FormEvent, useState } from "react";

import { ApiError, apiClient } from "@digit-auth/react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.patch("/profile/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Your password has been changed successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Unable to change your password. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <section>
        <p className="text-sm font-medium text-zinc-500">Account</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
          Security
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Manage your password and keep your DigitAuth account secure.
        </p>
      </section>

      <section className="mt-8 max-w-3xl rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-base font-semibold text-zinc-950">
            Change password
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Update your account password. You will need to provide your current
            password before choosing a new one.
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

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-zinc-900"
              >
                Current password
              </label>

              <div className="relative mt-2">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={isSaving}
                  autoComplete="current-password"
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 pr-20 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((visible) => !visible)}
                  disabled={isSaving}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-zinc-900"
              >
                New password
              </label>

              <div className="relative mt-2">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={isSaving}
                  autoComplete="new-password"
                  minLength={8}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 pr-20 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((visible) => !visible)}
                  disabled={isSaving}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Your new password must be at least 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-900"
              >
                Confirm new password
              </label>

              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={isSaving}
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 pr-20 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  disabled={isSaving}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-zinc-200 bg-zinc-50 px-6 py-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Changing password..." : "Change password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
