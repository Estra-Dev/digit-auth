/**
 * @openapi
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 6878dc30c8db8dc4d4b35b10
 *
 *         firstName:
 *           type: string
 *           example: Dominion
 *
 *         lastName:
 *           type: string
 *           example: Ikonwa
 *
 *         email:
 *           type: string
 *           example: dominion@dev.com
 *
 *         emailVerified:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *
 *         message:
 *           type: string
 *           example: Operation completed successfully.
 *
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *
 *         message:
 *           type: string
 *           example: Invalid credentials.
 *
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *
 *       properties:
 *         email:
 *           type: string
 *           example: dominion@dev.com
 *
 *         password:
 *           type: string
 *           example: Password123!
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     LoginResponse:
          type: object

          properties:

            user:

              $ref: '#/components/schemas/User'

            accessToken:

              type: string

              example: eyJhbGciOiJIUzI1Ni...

            refreshToken:

              type: string

              example: eyJhbGciOiJIUzI1Ni...
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *
 *       properties:
 *         firstName:
 *           type: string
 *           example: Dominion
 *
 *         lastName:
 *           type: string
 *           example: Ikonwa
 *
 *         email:
 *           type: string
 *           format: email
 *           example: dominion@dev.com
 *
 *         password:
 *           type: string
 *           format: password
 *           example: Password123!
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT Refresh Token issued during login.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *
 *     RefreshTokenResponse:
 *       type: object
 *
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Newly generated JWT Access Token.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *         refreshToken:
 *           type: string
 *           description: Newly generated JWT Refresh Token.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - token
 *
 *       properties:
 *         token:
 *           type: string
 *           description: Verification token received by email.
 *           example: 5c9162a3b0df42c98d9f11aef13fd5fd
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ResendVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: dominion@dev.com
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ForgotPasswordRequest:
 *       type: object
 *
 *       required:
 *         - email
 *
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: dominion@dev.com
 */

/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ResetPasswordRequest:
 *       type: object
 *
 *       required:
 *         - token
 *         - password
 *
 *       properties:
 *
 *         token:
 *           type: string
 *           description: Password reset token received by email.
 *           example: 5c9162a3b0df42c98d9f11aef13fd5fd
 *
 *         password:
 *           type: string
 *           format: password
 *           example: NewPassword123!
 */
export {};
