/**
 * @openapi
 *
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *
 *     description: |
 *       Invalidates every active login session belonging to the
 *       authenticated user.
 *
 *       After this operation completes, all Refresh Tokens issued
 *       to the user become unusable.
 *
 *       This endpoint is useful when:
 *
 *       - A device is lost
 *       - The user suspects unauthorized access
 *       - The user changes their password
 *       - The user wants to sign out everywhere
 *
 *     operationId: logoutAllDevices
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
 *     responses:
 *
 *       '200':
 *         description: Successfully logged out from all devices.
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
 *                   example: Logged Out from all Devices
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
