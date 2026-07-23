/**
 * @openapi
 *
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh authentication tokens
 *
 *     description: |
 *       Generates a new Access Token and a new Refresh Token.
 *
 *       DigitAuth implements **Refresh Token Rotation**.
 *
 *       Every successful refresh invalidates the previous refresh token
 *       and creates a brand-new authenticated session.
 *
 *       Clients must always replace the old refresh token with the new one
 *       returned by this endpoint.
 *
 *     operationId: refreshToken
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
 *             Refresh Example:
 *               value:
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     responses:
 *
 *       '200':
 *         description: Tokens refreshed successfully.
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
 *                   example: Token refreshed successfully.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   $ref: '#/components/schemas/RefreshTokenResponse'
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
