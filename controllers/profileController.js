const User = require('../models/user')

// TODO Add timestamp verification to prevent replay attacks.
exports.getUser = async (req, res, next) => {
    try {
        const { id } = req.params.id // id -> _id
        const filter = { _id: id }
        let user = await User.findOne(filter)
        if (user) {
            return res.status(200).json(user)
        } else {
            return res.status(404).json({ error: 'No user found with that id.' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!'})
    }
}

// exports.login = async (req, res) => {
//     try {
//         let user = await User.findOne({ email: email })
//         if (!user) {
//             res.status(404).json({ error: 'No user found!' })
//         } else {
//             let valid = user.validPassword(password)
//             if (valid) {
//                 let auth = await user.createAccessToken()
//                 let refreshtoken = await user.createRefreshToken()
//                 return res.status(200).json({ auth, refreshtoken })
//             } else {
//                 return res.status(401).json({ error: 'Invalid Password!'})
//             }
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error!' })
//     }
// }

// exports.generateRefreshToken = async (req, res) => {
//     try {
//         const { refreshtoken } = req.body
//         if (!refreshtoken) {
//             return res.status(403).json({ error: 'Access denied, missing token'})
//         } else {
//             const tokenDoc = await Token.findOne({ token: refreshtoken })
//             if (!tokenDoc) {
//                 return res.status(401).json({ error: 'Token Expired!' })
//             } else {
//                 const payload = jwt.verify(tokenDoc.token, REFRESH_SECRET)
//                 const auth = jwt.sign({ user: payload }, SHARED_SECRET, { expiresIn: '10m' })
//                 return res.status(200).json({ auth })
//             }
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error!' })
//     }
// }

// exports.logout = async (req, res) => {
//     try {
//         const { refreshtoken } = req.body
//         await Token.findOneAndDelete({ token: refreshtoken })
//         return res.status(200).json({ success: 'User Logged Out.'})
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error!' })
//     }
// }

// exports.magic = async (req, res) => {
//   const { email, portal } = req.body
//   try {
//     let user = await User.findOne({ email: email })
//     if (!user) {
//         res.status(404).json({ error: 'No user found!' }) // Tell the front end to lie
//     } else {
//       let auth = await user.createAccessToken(300)
      

//     const mailerSend = new MailerSend({
//       apiKey: API_KEY,
//     });

//     const sentFrom = new Sender(`no-reply@${SEND_DOMAIN}`, "no-reply");

//     const recipients = [
//       new Recipient(email, `${user.firstName} ${user.lastname}`)
//     ];

//     const emailParams = new EmailParams()
//       .setFrom(sentFrom)
//       .setTo(recipients)
//       .setReplyTo(sentFrom)
//       .setSubject("Magic-Link")
//       .setHtml('<strong>Here is the Magic Link you requested</strong>')
//       .setText(`https://${portal}.${SEND_DOMAIN}.com/magic?token=${auth}`);

//     await mailerSend.email.send(emailParams);
//           return res.status(200).send()
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error!' })
//     }
// }