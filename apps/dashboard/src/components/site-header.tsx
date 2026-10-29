"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DigitAuthLogo from "@/components/digit-auth-logo";

const navigation = [
  { label: "Features", href: "/#features" },
  { label: "Developers", href: "/#developers" },
  { label: "Docs", href: "/docs" },
  { label: "Platform", href: "/platform/login" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("digitauth-theme");
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;

    const useLight = savedTheme ? savedTheme === "light" : prefersLight;

    document.documentElement.classList.toggle("theme-light", useLight);
  }, []);

  function toggleTheme() {
    const nextLight =
      !document.documentElement.classList.contains("theme-light");

    document.documentElement.classList.toggle("theme-light", nextLight);

    localStorage.setItem("digitauth-theme", nextLight ? "light" : "dark");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10"
      >
        {/* Brand */}
        <Link
          href="/"
          aria-label="DigitAuth home"
          className="flex shrink-0 items-center gap-2.5 sm:gap-3"
          onClick={closeMenu}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10 sm:h-10 sm:w-10">
            <DigitAuthLogo className="h-7 w-7" />
          </span>

          <span className="text-lg font-semibold tracking-tight sm:text-xl">
            Digit<span className="text-blue-500">Auth</span>
          </span>
        </Link>

        {/* Desktop navigation and actions */}
        <div className="hidden items-center gap-5 md:flex lg:gap-7">
          <div className="flex items-center gap-6 text-sm lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="site-nav-link whitespace-nowrap transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light and dark themes"
              title="Toggle theme"
              className="theme-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:-translate-y-0.5"
            >
              <svg
                className="theme-icon-moon h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"
                />
              </svg>

              <svg
                className="theme-icon-sun h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  strokeLinecap="round"
                  d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"
                />
              </svg>
            </button>

            <Link
              href="/platform/login"
              className="site-nav-link whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-blue-500/10"
            >
              Sign in
            </Link>

            <Link
              href="/platform/register"
              className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="theme-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:bg-blue-500/10 md:hidden"
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        id="mobile-navigation"
        className={`site-mobile-menu overflow-hidden border-t transition-[max-height,opacity,visibility] duration-300 ease-in-out md:hidden ${
          menuOpen
            ? "visible max-h-[500px] opacity-100"
            : "invisible max-h-0 border-transparent opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
          {/* Main links */}
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                onClick={closeMenu}
                className="site-nav-link rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-blue-500/10"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-current/10" />

          {/* Theme preference */}
          <button
            type="button"
            tabIndex={menuOpen ? 0 : -1}
            onClick={toggleTheme}
            className="site-nav-link flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-blue-500/10"
          >
            <span>Appearance</span>

            <span className="flex items-center gap-2">
              <svg
                className="theme-icon-moon h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"
                />
              </svg>

              <svg
                className="theme-icon-sun h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  strokeLinecap="round"
                  d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"
                />
              </svg>
              <span className="text-xs opacity-70">Toggle theme</span>
            </span>
          </button>

          {/* Authentication actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/platform/login"
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="site-nav-link flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-blue-500/10"
            >
              Sign in
            </Link>

            <Link
              href="/platform/register"
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
