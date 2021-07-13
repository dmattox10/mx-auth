const dotenv = require('dotenv')
dotenv.config()

const {
    APP_PORT,
    APP_NAME,
//    REDIS_PORT,
    SHARED_SECRET,
    REFRESH_SECRET,
    ENVIRONMENT
} = process.env

let MONGO_URI = (env = ENVIRONMENT) => {
    let URI = ''
    const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASS, DATABASE } = process.env
    if (env === 'testing') {
        URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@mongo:27017/auth?authSource=admin`
    } else if (env === 'prod') {   
        
        URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${DATABASE}?authSource=admin`
    } else {
        URI = 'mongodb://localhost:27017/auth'
    }
    return URI
}


module.exports = {
    APP_PORT,
    APP_NAME,
    SHARED_SECRET,
    REFRESH_SECRET,
    MONGO_URI
}