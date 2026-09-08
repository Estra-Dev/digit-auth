const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearRefreshToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
