/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique activity identifier
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of user who performed the activity
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         resourceId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of resource involved in the activity
 *           example: "789e0123-e89b-12d3-a456-426614174002"
 *         actionType:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, VIEW]
 *           description: Type of action performed
 *           example: "CREATE"
 *         details:
 *           type: object
 *           nullable: true
 *           description: Additional context about the activity
 *           example: {"previousValues": {"status": "Draft"}, "newValues": {"status": "Published"}}
 *         ipAddress:
 *           type: string
 *           nullable: true
 *           description: IP address of the client
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           nullable: true
 *           description: User agent string of the client
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Activity timestamp
 *           example: "2023-12-14T10:30:00Z"
 *         user:
 *           type: object
 *           description: User who performed the activity
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "456e7890-e89b-12d3-a456-426614174001"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               format: email
 *               example: "john.doe@example.com"
 *             role:
 *               type: string
 *               enum: [CONTENT_MANAGER, VIEWER]
 *               example: "CONTENT_MANAGER"
 *         resource:
 *           type: object
 *           nullable: true
 *           description: Resource involved in the activity
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "789e0123-e89b-12d3-a456-426614174002"
 *             title:
 *               type: string
 *               example: "Introduction to Node.js"
 *             type:
 *               type: string
 *               enum: [Article, Video, Tutorial]
 *               example: "Article"
 *             status:
 *               type: string
 *               enum: [Draft, Published, Archived]
 *               example: "Published"
 *     
 *     ActivityList:
 *       type: object
 *       properties:
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 5
 */

/**
 * @swagger
 * /api/activity/logs:
 *   get:
 *     tags:
 *       - Activity Tracking
 *     summary: Get activity logs
 *     description: Retrieves paginated activity logs with optional filtering
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of activities per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by resource ID
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, VIEW]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities from this date (ISO 8601 format)
 *         example: "2023-12-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities until this date (ISO 8601 format)
 *         example: "2023-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity logs retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/activity/user/{userId}:
 *   get:
 *     tags:
 *       - Activity Tracking
 *     summary: Get activities for a specific user
 *     description: Retrieves paginated activity logs for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of activities per page
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, VIEW]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities from this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities until this date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: User activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User activities retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/activity/resource/{resourceId}:
 *   get:
 *     tags:
 *       - Activity Tracking
 *     summary: Get activities for a specific resource
 *     description: Retrieves paginated activity logs for a specific resource
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of activities per page
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, VIEW]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities from this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities until this date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Resource activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource activities retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */