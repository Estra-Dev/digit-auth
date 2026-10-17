"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useAuth } from "../lib/auth/auth-context";

export type UserProfileProps = {
  className?: string;
  showProfile?: boolean;
  showPassword?: boolean;
  showDeleteAccount?: boolean;
  onAccountDeleted?: () => void;
};

type Section = "profile" | "password" | "delete";

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "14px",
  lineHeight: 1.5,
  outlineOffset: "2px",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 15px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: "#172554",
  background: "#172554",
  color: "#ffffff",
};

const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: "#b91c1c",
  background: "#b91c1c",
  color: "#ffffff",
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function UserProfile({
  className,
  showProfile = true,
  showPassword = true,
  showDeleteAccount = true,
  onAccountDeleted,
}: UserProfileProps) {
  const {
    user,
    isLoading,
    isAuthenticated,
    updateProfile,
    changePassword,
    deleteAccount,
  } = useAuth();

  const id = useId();

  const profileSubmitting = useRef(false);
  const passwordSubmitting = useRef(false);
  const deleteSubmitting = useRef(false);

  const [section, setSection] = useState<Section>("profile");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [accountDeleted, setAccountDeleted] = useState(false);

  const availableSections = useMemo<Section[]>(() => {
    const result: Section[] = [];

    if (showProfile) result.push("profile");
    if (showPassword) result.push("password");
    if (showDeleteAccount) result.push("delete");

    return result;
  }, [showProfile, showPassword, showDeleteAccount]);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    if (!availableSections.includes(section)) {
      const firstAvailable = availableSections[0];

      if (firstAvailable) {
        setSection(firstAvailable);
      }
    }
  }, [availableSections, section]);

  if (isLoading) {
    return (
      <div className={className} role="status" aria-live="polite">
        Loading your account…
      </div>
    );
  }

  if (accountDeleted) {
    return (
      <div className={className} role="status" aria-live="polite">
        <h2>Account deleted</h2>
        <p>Your account deletion request completed successfully.</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={className} role="status">
        Please sign in to manage your account.
      </div>
    );
  }

  if (availableSections.length === 0) {
    return null;
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profileSubmitting.current) return;

    setProfileError("");
    setProfileSuccess("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (
      trimmedFirstName.length < 2 ||
      trimmedFirstName.length > 50 ||
      trimmedLastName.length < 2 ||
      trimmedLastName.length > 50
    ) {
      setProfileError("First and last names must each be 2–50 characters.");
      return;
    }

    const changes: { firstName?: string; lastName?: string } = {};

    const currentUser = user;

    if (!currentUser) {
      setProfileError("Please sign in to update your profile.");
      return;
    }

    if (trimmedFirstName !== currentUser.firstName) {
      changes.firstName = trimmedFirstName;
    }

    if (trimmedLastName !== currentUser.lastName) {
      changes.lastName = trimmedLastName;
    }

    if (Object.keys(changes).length === 0) {
      setProfileSuccess("Your profile is already up to date.");
      return;
    }

    profileSubmitting.current = true;
    setProfileBusy(true);

    try {
      await updateProfile(changes);
      setProfileSuccess("Your profile has been updated.");
    } catch (error) {
      setProfileError(errorMessage(error, "Unable to update your profile."));
    } finally {
      profileSubmitting.current = false;
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordSubmitting.current) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Your new password must differ from the current one.");
      return;
    }

    passwordSubmitting.current = true;
    setPasswordBusy(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Your password has been changed.");
    } catch (error) {
      setPasswordError(errorMessage(error, "Unable to change your password."));
    } finally {
      passwordSubmitting.current = false;
      setPasswordBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteSubmitting.current || deleteConfirmation !== "DELETE") {
      return;
    }

    deleteSubmitting.current = true;
    setDeleteBusy(true);
    setDeleteError("");

    try {
      await deleteAccount();
    } catch (error) {
      setDeleteError(errorMessage(error, "Unable to delete your account."));
      deleteSubmitting.current = false;
      setDeleteBusy(false);
      return;
    }

    setAccountDeleted(true);
    setDeleteBusy(false);

    // The deletion has already succeeded. A consumer callback error
    // must not be reported as a failed account deletion.
    try {
      onAccountDeleted?.();
    } catch {
      // The consumer is responsible for handling its callback errors.
    }
  }

  const sections: { id: Section; label: string }[] = [
    ...(showProfile ? [{ id: "profile" as const, label: "Profile" }] : []),
    ...(showPassword ? [{ id: "password" as const, label: "Password" }] : []),
    ...(showDeleteAccount
      ? [{ id: "delete" as const, label: "Delete account" }]
      : []),
  ];

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: "720px",
        color: "#0f172a",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h2
          style={{
            margin: "0 0 7px",
            fontSize: "25px",
            letterSpacing: "-0.6px",
          }}
        >
          Account settings
        </h2>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          Manage your personal information and account security.
        </p>
      </header>

      <nav
        aria-label="Account settings sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "14px",
        }}
      >
        {sections.map((item) => {
          const active = section === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={active ? "page" : undefined}
              style={{
                ...buttonStyle,
                borderColor: active ? "#172554" : "#e2e8f0",
                background: active ? "#eff6ff" : "#ffffff",
                color: active ? "#172554" : "#334155",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {section === "profile" && showProfile && (
        <section aria-labelledby={`${id}-profile-heading`}>
          <h3 id={`${id}-profile-heading`} style={{ marginTop: 0 }}>
            Personal information
          </h3>

          <div
            style={{
              marginBottom: "22px",
              padding: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {user.email}
            </div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                color: user.emailVerified ? "#166534" : "#92400e",
              }}
            >
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: "grid", gap: "17px" }}>
              <div>
                <label htmlFor={`${id}-first-name`} style={labelStyle}>
                  First name
                </label>
                <input
                  id={`${id}-first-name`}
                  name="firstName"
                  autoComplete="given-name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor={`${id}-last-name`} style={labelStyle}>
                  Last name
                </label>
                <input
                  id={`${id}-last-name`}
                  name="lastName"
                  autoComplete="family-name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {profileError && (
              <p role="alert" style={{ color: "#b91c1c", fontSize: "14px" }}>
                {profileError}
              </p>
            )}

            {profileSuccess && (
              <p role="status" style={{ color: "#166534", fontSize: "14px" }}>
                {profileSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={profileBusy}
              style={{
                ...primaryButtonStyle,
                marginTop: "20px",
                opacity: profileBusy ? 0.7 : 1,
                cursor: profileBusy ? "wait" : "pointer",
              }}
            >
              {profileBusy ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      )}

      {section === "password" && showPassword && (
        <section aria-labelledby={`${id}-password-heading`}>
          <h3 id={`${id}-password-heading`} style={{ marginTop: 0 }}>
            Change password
          </h3>

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ display: "grid", gap: "17px" }}>
              <div>
                <label htmlFor={`${id}-current-password`} style={labelStyle}>
                  Current password
                </label>
                <input
                  id={`${id}-current-password`}
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor={`${id}-new-password`} style={labelStyle}>
                  New password
                </label>
                <input
                  id={`${id}-new-password`}
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor={`${id}-confirm-password`} style={labelStyle}>
                  Confirm new password
                </label>
                <input
                  id={`${id}-confirm-password`}
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {passwordError && (
              <p role="alert" style={{ color: "#b91c1c", fontSize: "14px" }}>
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p role="status" style={{ color: "#166534", fontSize: "14px" }}>
                {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordBusy}
              style={{
                ...primaryButtonStyle,
                marginTop: "20px",
                opacity: passwordBusy ? 0.7 : 1,
                cursor: passwordBusy ? "wait" : "pointer",
              }}
            >
              {passwordBusy ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      )}

      {section === "delete" && showDeleteAccount && (
        <section aria-labelledby={`${id}-delete-heading`}>
          <h3
            id={`${id}-delete-heading`}
            style={{ marginTop: 0, color: "#b91c1c" }}
          >
            Delete account
          </h3>

          <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.7 }}>
            Account deletion is permanent. You may lose access to your account
            and associated data. Confirm that you want to continue.
          </p>

          <div
            style={{
              padding: "17px",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              background: "#fff7f7",
            }}
          >
            <label htmlFor={`${id}-delete-confirmation`} style={labelStyle}>
              Type DELETE to confirm
            </label>

            <input
              id={`${id}-delete-confirmation`}
              name="deleteConfirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="DELETE"
              style={inputStyle}
            />

            {deleteError && (
              <p role="alert" style={{ color: "#b91c1c", fontSize: "14px" }}>
                {deleteError}
              </p>
            )}

            <button
              type="button"
              disabled={deleteBusy || deleteConfirmation !== "DELETE"}
              onClick={() => void handleDeleteAccount()}
              style={{
                ...dangerButtonStyle,
                marginTop: "15px",
                opacity:
                  deleteBusy || deleteConfirmation !== "DELETE" ? 0.6 : 1,
                cursor:
                  deleteBusy || deleteConfirmation !== "DELETE"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {deleteBusy ? "Deleting account…" : "Permanently delete account"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
