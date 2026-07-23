/**
 * @openapi
 *
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *
 *     description: |
 *       Resets a user's password using a valid password reset token.
 *
 *       On success:
 *
 *       - The password is securely hashed.
 *       - The reset token is permanently deleted.
 *       - Every active login session belonging to the user is revoked.
 *
 *       This means the user must log in again on every device.
 *
 *     operationId: resetPassword
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
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *
 *           examples:
 *             Reset Password:
 *               value:
 *                 token: 5c9162a3b0df42c98d9f11aef13fd5fd
 *                 password: NewPassword123!
 *
 *     responses:
 *
 *       '200':
 *         description: Password reset successfully.
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
 *                   example: Password reset successfully.
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
 *         description: Invalid or expired password reset token.
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
