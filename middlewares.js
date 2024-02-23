// const jwt = require('jsonwebtoken')
// const { SHARED_SECRET } = require('./env')

// exports.checkAuth = (req, res, next) => {
//     const token = req.get('x-auth-token')
//     if (!token) {
//         return res.status(401).json({ error: 'Access denied, missing token' })
//     } else {
//         try {
//             const payload = jwt.verify(token, SHARED_SECRET)
//             req.user = payload.user
//             next()
//         } catch (error) {
//             if (error.name === 'TokenExpiredError') {
//                 return res.status(401).json({ error: 'Token expired, please login again.' })
//             } else if (error.name === 'JsonWebTokenError') {
//                 return res.status(401).json({ error: 'Invalid Token, please login again.' })
//             } else {
//                 console.error(error)
//                 return res.status(400).json({ error })
//             }
//         }
//     }
// }

const jwt = require('jsonwebtoken')
const { SHARED_SECRET, REFRESH_SECRET } = require('./env')

const authenticate = (req, res, next) => {
    const accessToken = req.headers['Authorization']
    const refreshToken = req.headers['refreshtoken']
  
    if (!accessToken && !refreshToken) {
      return res.status(401).send('Access Denied. No token provided.');
    }
  
    try {
      const decoded = jwt.verify(accessToken, SHARED_SECRET);
      req.user = decoded.user;
      next();
    } catch (error) { // NOTE I love this pattern of trying something else in the catch!
      if (!refreshToken) {
        return res.status(498).send('Access Denied. No refresh token provided.');
      }
  
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const accessToken = jwt.sign({ user: decoded.user }, SHARED_SECRET, { expiresIn: '1h' });
        req.user = decoded.user
        res
          .status(307)
          .header('refreshtoken', refreshToken)
          .header('Authorization', accessToken)
          .send(decoded.user);
      } catch (error) {
        return res.status(400).send('Invalid Token.');
      }
    }
  }

  module.exports = authenticate