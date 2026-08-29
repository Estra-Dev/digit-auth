/**
 * @openapi
 *
 * /api/v1/security/events:
 *   get:
 *     summary: Get current user's security events
 *
 *     description: |
 *       Returns the security events associated with the currently
 *       authenticated user.
 *
 *     operationId: getSecurityEvents
 *
 *     tags:
 *       - Security
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *
 *       '200':
 *         description: Security events retrieved successfully.
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
 *                   example: Security events retrieved successfully.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SecurityEvent'
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
