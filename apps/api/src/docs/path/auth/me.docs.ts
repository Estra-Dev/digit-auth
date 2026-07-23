/**
 * @openapi
 *
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *
 *     description: |
 *       Returns the profile of the currently authenticated user.
 *
 *       This endpoint requires a valid Access Token in the
 *       Authorization header.
 *
 *       Example:
 *
 *       Authorization: Bearer <access_token>
 *
 *     operationId: getCurrentUser
 *
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *
 *       '200':
 *         description: Current user retrieved successfully.
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
 *                   example: Current user retrieved successfully.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *
 *       '401':
 *         description: Authentication required.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
