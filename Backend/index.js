const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const AuthRoute = require('./routers/authRoute.js');
const ResourceRoute = require('./routers/resourceRoutes.js');
const ActivityRoute = require('./routers/activityRoutes.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('swagger-jsdoc');
const swaggerDef = require("./config/swagger.json");

require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

// Generate swagger specification
const spec = swaggerDoc(swaggerDef);

app.get('/health', (req, res) =>{
    res.status(200).json(new Date().toLocaleString());
})

// Swagger UI setup - single instance
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use('/api/auth', AuthRoute);
app.use('/api/resource', ResourceRoute);
app.use('/api/activity', ActivityRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});