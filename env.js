require('dotenv').config()

const {
  APP_PORT,
  APP_NAME,
  //    REDIS_PORT,
  SHARED_SECRET,
  REFRESH_SECRET,
  ENVIRONMENT,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env

module.exports = {
  APP_PORT,
  APP_NAME,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  ENVIRONMENT,
  REFRESH_SECRET,
  SHARED_SECRET
}
