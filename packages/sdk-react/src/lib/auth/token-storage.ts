const ACCESS_TOKEN_KEY = "digit_auth_access_token";
const REFRESH_TOKEN_KEY = "digit_auth_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clearAccessToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearRefreshToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
