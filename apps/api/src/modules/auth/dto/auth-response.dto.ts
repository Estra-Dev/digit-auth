export interface AuthResponseDto {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
  };

  accessToken: string;
  refreshToken: string;
}
