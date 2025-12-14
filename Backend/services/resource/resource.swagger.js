/**
 * @swagger
 * components:
 *   schemas:
 *     ResourceCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - url
 *       properties:
 *         title:
 *           type: string
 *           description: Resource title
 *           example: "Introduction to Node.js"
 *         description:
 *           type: string
 *           description: Resource description
 *           example: "A comprehensive guide to getting started with Node.js"
 *         type:
 *           type: string
 *           enum: [Article, Video, Tutorial]
 *           description: Type of resource
 *           example: "Article"
 *         url:
 *           type: string
 *           format: uri
 *           description: Resource URL
 *           example: "https://example.com/nodejs-guide"
 *         tags:
 *           type: string
 *           description: Comma-separated tags
 *           example: "nodejs,javascript,backend"
 *         status:
 *           type: string
 *           enum: [Draft, Published, Archived]
 *           description: Resource status
 *           example: "Draft"
 *     
 *     ResourceUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Resource title
 *           example: "Advanced Node.js Concepts"
 *         description:
 *           type: string
 *           description: Resource description
 *           example: "Deep dive into advanced Node.js concepts"
 *         type:
 *           type: string
 *           enum: [Article, Video, Tutorial]
 *           description: Type of resource
 *           example: "Tutorial"
 *         url:
 *           type: string
 *           format: uri
 *           description: Resource URL
 *           example: "https://example.com/advanced-nodejs"
 *         tags:
 *           type: string
 *           description: Comma-separated tags
 *           example: "nodejs,advanced,performance"
 *         status:
 *           type: string
 *           enum: [Draft, Published, Archived]
 *           description: Resource status
 *           example: "Published"
 *     
 *     Resource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique resource identifier
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         title:
 *           type: string
 *           description: Resource title
 *           example: "Introduction to Node.js"
 *         description:
 *           type: string
 *           description: Resource description
 *           example: "A comprehensive guide to getting started with Node.js"
 *         type:
 *           type: string
 *           enum: [Article, Video, Tutorial]
 *           description: Type of resource
 *           example: "Article"
 *         url:
 *           type: string
 *           format: uri
 *           description: Resource URL
 *           example: "https://example.com/nodejs-guide"
 *         tags:
 *           type: string
 *           description: Comma-separated tags
 *           example: "nodejs,javascript,backend"
 *         status:
 *           type: string
 *           enum: [Draft, Published, Archived]
 *           description: Resource status
 *           example: "Draft"
 *         createdByUserId:
 *           type: string
 *           format: uuid
 *           description: ID of user who created the resource
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Resource creation timestamp
 *           example: "2023-12-14T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Resource last update timestamp
 *           example: "2023-12-14T10:30:00Z"
 *     
 *     ResourceList:
 *       type: object
 *       properties:
 *         resources:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Resource'
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
 *   
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/resource/add:
 *   post:
 *     tags:
 *       - Resources
 *     summary: Create a new resource
 *     description: Creates a new resource (requires CONTENT_MANAGER role)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceCreate'
 *     responses:
 *       201:
 *         description: Resource created successfully
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
 *                   example: "Resource created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
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
 * /api/resource/list:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Get list of resources
 *     description: Retrieves a paginated list of resources
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
 *         description: Number of resources per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Article, Video, Tutorial]
 *         description: Filter by resource type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Published, Archived]
 *         description: Filter by resource status
 *     responses:
 *       200:
 *         description: Resource list retrieved successfully
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
 *                   example: "Resource list"
 *                 data:
 *                   $ref: '#/components/schemas/ResourceList'
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
 * /api/resource/{id}:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Get a specific resource
 *     description: Retrieves a resource by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
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
 *                   example: "Resource fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
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
 *   
 *   put:
 *     tags:
 *       - Resources
 *     summary: Update a resource
 *     description: Updates an existing resource (requires CONTENT_MANAGER role)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceUpdate'
 *     responses:
 *       200:
 *         description: Resource updated successfully
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
 *                   example: "Resource updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
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
 *   
 *   delete:
 *     tags:
 *       - Resources
 *     summary: Delete a resource
 *     description: Deletes an existing resource (requires CONTENT_MANAGER role)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
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
 *                   example: "Resource deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
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