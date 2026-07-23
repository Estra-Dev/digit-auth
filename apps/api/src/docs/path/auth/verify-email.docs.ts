/**
 * @openapi
 *
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *
 *     description: |
 *       Verifies a newly registered user's email address using the
 *       verification token sent to their email.
 *
 *       A successful verification marks the user's account as verified
 *       and permanently removes the verification token from the database.
 *
 *       Verification tokens are single-use and expire automatically.
 *
 *     operationId: verifyEmail
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
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *
 *           examples:
 *             Verify Email:
 *               value:
 *                 token: 5c9162a3b0df42c98d9f11aef13fd5fd
 *
 *     responses:
 *
 *       '200':
 *         description: Email verified successfully.
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
 *                   example: Email Verified Successfully
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   nullable: true
 *                   example: null
 *
 *       '400':
 *         description: Invalid or expired verification token.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
