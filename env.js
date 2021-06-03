const dotenv = require('dotenv')
dotenv.config()

const {
    APP_PORT,
//    REDIS_PORT,
    SHARED_SECRET,
    REFRESH_SECRET,

} = process.env


    const ENVIRONMENT = process.env
    let MONGO_URI = ''
    if (ENVIRONMENT === 'testing') {
        MONGO_URI = 'mongodb://mongo:27017/auth'
    } else if (ENVIRONMENT === 'prod') {   
        const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASS } = process.env
        MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/auth?authSource=admin`
    } else {
        MONGO_URI = 'mongodb://localhost:27017/auth'
    }


module.exports = {
    APP_PORT,
    SHARED_SECRET,
    REFRESH_SECRET,
    MONGO_URI
}