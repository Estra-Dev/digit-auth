import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import DigitAuthLogo from "@/components/digit-auth-logo";

type PlatformAuthLayoutProps = {
  children: ReactNode;
  variant: "login" | "register";
};

export default function PlatformAuthLayout({
  children,
  variant,
}: PlatformAuthLayoutProps) {
  const isLogin = variant === "login";

  return (
    <>
      <SiteHeader />

      <main className={`platform-auth-page platform-auth-page--${variant}`}>
        <div className="platform-auth-backdrop" aria-hidden="true">
          <div className="platform-auth-glow platform-auth-glow--one" />
          <div className="platform-auth-glow platform-auth-glow--two" />

          <div className="platform-auth-orbit platform-auth-orbit--one">
            <span className="platform-auth-orbit-dot" />
          </div>

          <div className="platform-auth-orbit platform-auth-orbit--two">
            <span className="platform-auth-orbit-dot platform-auth-orbit-dot--blue" />
          </div>

          <div className="platform-auth-orbit platform-auth-orbit--three">
            <span className="platform-auth-orbit-dot platform-auth-orbit-dot--violet" />
          </div>

          <div className="platform-auth-orbit-core">
            <DigitAuthLogo className="h-11 w-11 md:h-16 md:w-16" />
          </div>
        </div>

        <div className="platform-auth-content">
          <section className="platform-auth-intro">
            <span className="platform-auth-eyebrow">
              <span className="platform-auth-eyebrow-dot" />
              DIGITAUTH DEVELOPER PLATFORM
            </span>

            <h1>
              {isLogin ? (
                <>
                  Your next idea.
                  <br />
                  <span>Secure by design.</span>
                </>
              ) : (
                <>
                  Build with confidence.
                  <br />
                  <span>Start with DigitAuth.</span>
                </>
              )}
            </h1>

            <p>
              {isLogin
                ? "Manage your applications, credentials, and authentication infrastructure from one secure workspace."
                : "Create your developer account and get a dedicated workspace for managing your applications and authentication."}
            </p>

            <div className="platform-auth-trust">
              <span className="platform-auth-trust-icon">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M10 2.5 16 5v4.3c0 3.7-2.5 6.5-6 8.2-3.5-1.7-6-4.5-6-8.2V5l6-2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m7.2 9.8 1.8 1.8 3.8-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span>One workspace. Your applications. Your control.</span>
            </div>
          </section>

          <section className="platform-auth-card">{children}</section>

          <p className="platform-auth-caption">
            Developer infrastructure by DigitAuth
          </p>
        </div>
      </main>
    </>
  );
}
