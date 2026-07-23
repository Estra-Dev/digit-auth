/**
 * @openapi
 *
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout current device
 *
 *     description: |
 *       Logs the user out from the current device by invalidating
 *       the supplied Refresh Token.
 *
 *       The corresponding login session is permanently removed from
 *       the database.
 *
 *       After logout, the supplied Refresh Token can no longer be
 *       used to generate new Access Tokens.
 *
 *     operationId: logoutUser
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
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *
 *           examples:
 *             Logout Example:
 *               value:
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     responses:
 *
 *       '200':
 *         description: Logout successful.
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
 *                   example: Logged Out Successfully
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
 *         description: Invalid or expired refresh token.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
