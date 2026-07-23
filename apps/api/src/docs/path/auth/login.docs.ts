/**
 * @openapi
 *
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *
 *     description: |
 *       Authenticates a user using their email and password.
 *
 *       If the credentials are valid and the email has already been verified,
 *       the server returns a new Access Token together with a Refresh Token.
 *
 *       A new login session is also created and stored in the database.
 *
 *     operationId: loginUser
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
 *             $ref: '#/components/schemas/LoginRequest'
 *
 *           examples:
 *             Login Example:
 *               value:
 *                 email: dominionyungmann@gmail.com
 *                 password: Password123!
 *
 *     responses:
 *
 *       '200':
 *         description: Login successful.
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
 *                   example: Login Successful.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *
 *       '401':
 *         description: Invalid email or password.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '403':
 *         description: Email has not been verified.
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
