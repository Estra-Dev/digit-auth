/**
 * @openapi
 *
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *
 *     description: |
 *       Sends a password reset email containing a secure one-time reset token.
 *
 *       For security reasons, this endpoint always returns a success response,
 *       even if the supplied email address does not exist.
 *
 *       This prevents attackers from determining whether an email address
 *       is registered in the system.
 *
 *     operationId: forgotPassword
 *
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *
 *           examples:
 *             Forgot Password:
 *               value:
 *                 email: dominionyungmann@gmail.com
 *
 *     responses:
 *
 *       '200':
 *         description: Password reset email processed successfully.
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: If an account exists, a password reset email has been sent.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   nullable: true
 *                   example: null
 *
 *       '422':
 *         description: Validation failed.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
