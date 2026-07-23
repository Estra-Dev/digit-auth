/**
 * @openapi
 *
 * /api/v1/auth/resend-verification-email:
 *   post:
 *     summary: Resend verification email
 *
 *     description: |
 *       Sends a new email verification link to an existing user whose
 *       email address has not yet been verified.
 *
 *       If a previous verification token exists, it is invalidated and
 *       replaced with a newly generated verification token.
 *
 *     operationId: resendVerificationEmail
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
 *             $ref: '#/components/schemas/ResendVerificationRequest'
 *
 *           examples:
 *             Resend Verification:
 *               value:
 *                 email: dominionyungmann@dev.com
 *
 *     responses:
 *
 *       '200':
 *         description: Verification email sent successfully.
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
 *                   example: If an account exists, a verification email sent.
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
 *         description: Email is already verified.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '404':
 *         description: User not found.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
