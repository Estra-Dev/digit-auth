/**
 * @openapi
 *
 * /api/v1/profile/password:
 *   patch:
 *     summary: Change current user's password
 *
 *     description: |
 *       Changes the authenticated user's password after verifying
 *       the current password.
 *
 *     operationId: changePassword
 *
 *     tags:
 *       - Profile
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *
 *     responses:
 *
 *       '200':
 *         description: Password changed successfully.
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   nullable: true
 *                   example: null
 *
 *       '401':
 *         description: Authentication required or current password is incorrect.
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
