export const buildRegisterPayload = (
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }> = {},
) => {
  const password = "Password123@";

  return {
    firstName: "Dominion",
    lastName: "Ikonwa",
    email: `user-${Date.now()}@example.com`,
    password,
    confirmPassword: password,

    ...overrides,
  };
};
