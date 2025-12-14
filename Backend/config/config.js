require('dotenv').config();

module.exports ={
  "development": {
    "username": `${process.env.DB_USERNAME}`,
    "password": `${process.env.DB_PASSWORD}`,
    "database": `${process.env.DB_NAME}`,
    "host": `${process.env.DB_HOST}`,
    "port" : process.env.DB_PORT,
    "dialect": "postgres"
  },
  "test": {
    "username": "test_user",
    "password": "test_password",
    "database": "test_database",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  }
}
