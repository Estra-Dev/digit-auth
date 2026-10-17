import type { CSSProperties, ReactNode } from "react";

export const authInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #303e59",
  borderRadius: "11px",
  background: "#111c32",
  color: "#f8fafc",
  fontSize: "14px",
  lineHeight: 1.5,
  outline: "none",
  transition: "border-color 160ms ease, box-shadow 160ms ease",
};

export const authLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#d7dfef",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.1px",
};

export function AuthStyles() {
  return (
    <style>{`
      .da-auth,
      .da-auth * {
        box-sizing: border-box;
      }

      .da-auth {
        width: 100%;
        max-width: 460px;
        min-width: 0;
        margin: 0 auto;
        padding: clamp(22px, 5vw, 36px);
        overflow: hidden;
        position: relative;
        isolation: isolate;
        color: #f8fafc;
        background:
          radial-gradient(ellipse at 90% 0%, rgba(59, 130, 246, .17), transparent 43%),
          linear-gradient(155deg, #111d35 0%, #0b1222 65%, #0a1020 100%);
        border: 1px solid rgba(148, 163, 184, .18);
        border-radius: 22px;
        box-shadow:
          0 24px 70px rgba(2, 6, 23, .28),
          inset 0 1px 0 rgba(255,255,255,.035);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system,
          BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      .da-auth a {
        color: #8db7ff;
        font-weight: 650;
        text-decoration: none;
        transition: color 160ms ease;
      }

      .da-auth a:hover {
        color: #c1d7ff;
        text-decoration: underline;
        text-underline-offset: 4px;
      }

      .da-auth input:not([type="checkbox"]) {
        max-width: 100%;
      }

      .da-auth input:not([type="checkbox"]):focus {
        border-color: #6699ff !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, .18);
        outline: none;
      }

      .da-auth input::placeholder {
        color: #7787a2;
        opacity: 1;
      }

      .da-auth input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin: 0;
        flex: 0 0 auto;
        accent-color: #6495ff;
        cursor: pointer;
      }

      .da-auth__brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 32px;
      }

      .da-auth__mark {
        width: 43px;
        height: 43px;
        flex: 0 0 43px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 164, 255, .35);
        border-radius: 14px;
        background: linear-gradient(145deg, #244d94, #152b53);
        box-shadow: 0 6px 20px rgba(37, 99, 235, .2);
      }

      .da-auth__wordmark {
        font-size: 17px;
        line-height: 1.2;
        letter-spacing: -.55px;
        font-weight: 800;
      }

      .da-auth__wordmark span {
        color: #86adff;
      }

      .da-auth__brand-caption {
        display: block;
        margin-top: 4px;
        color: #8493ac;
        font-size: 11px;
        letter-spacing: .35px;
      }

      .da-auth__heading {
        margin: 0 0 9px;
        font-size: clamp(25px, 5vw, 30px);
        line-height: 1.2;
        letter-spacing: -1px;
        font-weight: 750;
      }

      .da-auth__description {
        margin: 0;
        color: #9ba9c0;
        font-size: 14px;
        line-height: 1.7;
      }

      .da-auth__header {
        margin-bottom: 27px;
      }

      .da-auth__field {
        min-width: 0;
        margin-bottom: 19px;
      }

      .da-auth__field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 13px;
      }

      .da-auth__field-grid > * {
        min-width: 0;
      }

      .da-auth__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .da-auth__check {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: #aab7cb;
        font-size: 13px;
        line-height: 1.5;
        cursor: pointer;
      }

      .da-auth__primary {
        width: 100%;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 21px;
        padding: 13px 17px;
        border: 1px solid #4e83ed;
        border-radius: 12px;
        background: linear-gradient(135deg, #3979ed, #285bc4);
        box-shadow: 0 8px 22px rgba(37, 99, 235, .2);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 160ms ease, filter 160ms ease,
          box-shadow 160ms ease;
      }

      .da-auth__primary:hover:not(:disabled) {
        filter: brightness(1.09);
        transform: translateY(-1px);
        box-shadow: 0 11px 26px rgba(37, 99, 235, .28);
      }

      .da-auth__primary:focus-visible {
        outline: 3px solid rgba(125, 164, 255, .8);
        outline-offset: 3px;
      }

      .da-auth__primary:disabled {
        cursor: not-allowed;
        opacity: .7;
        box-shadow: none;
      }

      .da-auth__error {
        margin: 0 0 15px;
        padding: 12px 13px;
        color: #fecaca;
        background: rgba(127, 29, 29, .2);
        border: 1px solid rgba(248, 113, 113, .32);
        border-radius: 11px;
        font-size: 13px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .da-auth__success {
        padding: 20px;
        border: 1px solid rgba(96, 165, 250, .24);
        border-radius: 15px;
        background: rgba(30, 58, 100, .22);
      }

      .da-auth__success-mark {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        margin-bottom: 17px;
        border: 1px solid rgba(96, 165, 250, .28);
        border-radius: 15px;
        background: rgba(59, 130, 246, .14);
        color: #9bc0ff;
        font-size: 22px;
      }

      .da-auth__divider {
        height: 1px;
        margin: 25px 0 19px;
        background: linear-gradient(90deg, transparent, #2a3851, transparent);
      }

      .da-auth__switch {
        margin: 22px 0 0;
        color: #9ba9c0;
        font-size: 13px;
        line-height: 1.8;
        text-align: center;
      }

      .da-auth__trust {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        color: #8291aa;
        font-size: 11px;
        letter-spacing: .2px;
        text-align: center;
      }

      .da-auth__trust strong {
        color: #b9c9e6;
        font-weight: 650;
      }

      .da-auth__spinner {
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255,255,255,.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: da-auth-spin 700ms linear infinite;
      }

      @keyframes da-auth-spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 420px) {
        .da-auth {
          padding: 23px 19px;
          border-radius: 17px;
        }

        .da-auth__brand {
          margin-bottom: 27px;
        }

        .da-auth__header {
          margin-bottom: 23px;
        }

        .da-auth__field-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .da-auth *,
        .da-auth *::before,
        .da-auth *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}

export function AuthBrand() {
  return (
    <div className="da-auth__brand">
      <div className="da-auth__mark" aria-hidden="true">
        <svg
          width="23"
          height="25"
          viewBox="0 0 24 26"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2.2 21 5.7v6.4c0 5.7-3.7 9.4-9 11.7-5.3-2.3-9-6-9-11.7V5.7L12 2.2Z"
            stroke="#DCE8FF"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m8 12.7 2.6 2.6 5.5-5.7"
            stroke="#8DB7FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <div className="da-auth__wordmark">
          digit<span>auth</span>
        </div>
        <span className="da-auth__brand-caption">
          Authentication infrastructure
        </span>
      </div>
    </div>
  );
}

export function AuthTrustFooter() {
  return (
    <>
      <div className="da-auth__divider" />
      <div className="da-auth__trust">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3 20 6v5.5c0 5-3.2 8.2-8 10.5-4.8-2.3-8-5.5-8-10.5V6l8-3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          Secured by <strong>DigitAuth</strong>
        </span>
      </div>
    </>
  );
}

export function AuthFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={`da-auth${className ? ` ${className}` : ""}`}>
      <AuthStyles />
      {children}
    </section>
  );
}
