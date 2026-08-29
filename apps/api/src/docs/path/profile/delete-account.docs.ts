/**
 * @openapi
 *
 * /api/v1/profile:
 *   delete:
 *     summary: Delete current user's account
 *
 *     description: |
 *       Permanently deletes the authenticated user's account.
 *
 *     operationId: deleteAccount
 *
 *     tags:
 *       - Profile
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *
 *       '200':
 *         description: Account deleted successfully.
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
 *                   example: Account deleted successfully.
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
 *         description: Authentication required.
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
