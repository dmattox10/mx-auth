const dotenv = require('dotenv')
dotenv.config()

const {
    APP_PORT,
//    REDIS_PORT,
    SHARED_SECRET,
    REFRESH_SECRET,
    ENVIRONMENT
} = process.env

let MONGO_URI = (env = ENVIRONMENT) => {
    console.log(env)
    let URI = ''
    if (env === 'testing') {
        URI = 'mongodb://mongo:27017/auth'
    } else if (env === 'prod') {   
        const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASS } = process.env
        URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/auth?authSource=admin`
    } else {
        URI = 'mongodb://localhost:27017/auth'
    }
    return URI
}


module.exports = {
    APP_PORT,
    SHARED_SECRET,
    REFRESH_SECRET,
    MONGO_URI
}