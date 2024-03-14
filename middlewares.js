// const jwt = require('jsonwebtoken')
// const { SHARED_SECRET } = require('./env')

// exports.checkauth = (req, res, next) => {
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
    const auth = req.headers['auth']
    const refreshtoken = req.headers['refreshtoken']
  
    if (!auth && !refreshtoken) {
      return res.status(401).send('Access Denied. No token provided.');
    }
  
    try {
      const decoded = jwt.verify(auth, SHARED_SECRET);
      req.user = decoded.user;
      next();
    } catch (error) { // NOTE I love this pattern of trying something else in the catch!
      if (!refreshtoken) {
        return res.status(498).send('Access Denied. No refresh token provided.');
      }
  
      try {
        const decoded = jwt.verify(refreshtoken, REFRESH_SECRET);
        const auth = jwt.sign({ user: decoded.user }, SHARED_SECRET, { expiresIn: '1h' });
        req.user = decoded.user
        res
          .status(307)
          .header('refreshtoken', refreshtoken)
          .header('auth', auth)
          .send(decoded.user);
      } catch (error) {
        return res.status(400).send('Invalid Token.');
      }
    }
  }

  module.exports = authenticate