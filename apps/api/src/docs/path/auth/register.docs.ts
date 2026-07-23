/**
 * @openapi
 *
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *
 *     description: |
 *       Creates a new user account.
 *
 *       After a successful registration, a verification email is sent
 *       to the user's email address.
 *
 *       The account cannot log in until the email has been verified.
 *
 *     operationId: registerUser
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
 *             $ref: '#/components/schemas/RegisterRequest'
 *
 *           examples:
 *             Register Example:
 *               value:
 *                 firstName: Dominion
 *                 lastName: Ikonwa
 *                 email: dominionyung@dev.com
 *                 password: Password123!
 *
 *     responses:
 *
 *       '201':
 *         description: User registered successfully.
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
 *                   example: User registered successfully.
 *
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *
 *       '409':
 *         description: Email already exists.
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
