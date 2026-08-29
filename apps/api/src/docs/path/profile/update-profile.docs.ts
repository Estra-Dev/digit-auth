/**
 * @openapi
 *
 * /api/v1/profile:
 *   patch:
 *     summary: Update current user's profile
 *
 *     description: |
 *       Updates the authenticated user's first name and/or last name.
 *
 *     operationId: updateProfile
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
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *
 *     responses:
 *
 *       '200':
 *         description: Profile updated successfully.
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
 *                   example: Profile updated successfully.
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
