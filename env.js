import dotenv from 'dotenv'
dotenv.config()

export const {
    APP_PORT,
//    REDIS_PORT,
    MONGO_URI,
    SHARED_SECRET,
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,

} = process.env

export const MONGO_URI_DEV = 'mongodb://localhost:27017/mx-auth'