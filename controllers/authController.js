const knex = require('knex')
const jwt = require('jsonwebtoken')
const cuid = require('cuid')
const nodeMailer = require('nodemailer')

const { DOMAIN, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, REFRESH_SECRET, SHARED_SECRET } = require('../env')

exports.register = async (req, res) => {
  const { email, hashedPassword, portal } = req.body
  console.log(portal)
  if (!email || !hashedPassword || !portal) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const userCuid = cuid()
    let portals = []
    portals.push(portal)
    const [user] = await knex
      .table('users')
      .insert({
        hashedPassword,
        portals,
        email,
        userCuid
      })
      .returning('*')

    return res.status(200).json(user)
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.login = async (req, res) => {
  const { email, hashedPassword, portal, userCuid } = req.body

  if (!email || !hashedPassword) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const [user] = await knex
      .table('users')
      .where('email', email)

    if (hashedPassword === user.hashedPassword) {
      // safe place to edit the unning list of which of the services auth is mx-auth is used for that this user uses
      if (!user.portals.includes(portal)) {
        let portalsCopy = [...user.portals]
        portalsCopy.push(portal)
        const changes = {
          portals: portalsCopy
        }
        const editedUser = await knex
          .table('users')
          .where('email', email)
          .update(changes)
      }
      const accessToken = jwt.sign(
        {
          id: user.id,
          role: 'user'
        },
        `${SHARED_SECRET}`,
        {
          expiresIn: '24h'
        }
      )
      const refreshToken = jwt.sign(
        {
          id: user.id
        },
        `${REFRESH_SECRET}`
      )

      const [actToken] = await knex
        .table('tokens')
        .where('userId', user.id)

      if (actToken) {
        await knex
          .table('tokens')
          .update({ 
            activeToken: refreshToken,
            userCuid: userCuid })
          .where('userId', user.id)
      } else {
        await knex.table('tokens').insert({
          userId: user.id,
          activeToken: refreshToken,
          userCuid: userCuid
        })
      }

      return res.status(200).json({ accessToken, refreshToken })
    }

    return res.status(400).json({ err: 'Incorrect password.' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.magic = async (req, res) => {
  const { email, portal } = req.body

  if (!email) {
    return res.status(400).json({ err: 'All fields required.' })
  }

  try {
    const [user] = await knex
      .table('users')
      .where('email', email)

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user'
      },
      `${SHARED_SECRET}`,
      {
        expiresIn: '5m'
      }
    )

    const [actToken] = await knex
      .table('tokens')
      .where('userId', user.id)

    if (actToken) {
      await knex
        .table('tokens')
        .update({ 
          activeToken: refreshToken,
          userCuid: userCuid })
        .where('userId', user.id)
    } else {
      await knex.table('tokens').insert({
        userId: user.id,
        activeToken: refreshToken,
        userCuid: userCuid
      })
    }
      // Send the email
      const transport = nodeMailer.createTransport({
        host: EMAIL_HOST,
        port: 587,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
      })
      
    const emailTemplate = ({ email, link }) => `
      <h2>Hey ${email}</h2>
      <p>Here's the magic link you just requested:</p>
      <p>${link}</p>
      `

    const mailOptions = {
      from: "mx-auth",
      html: emailTemplate({
        email,
        link: `https://${portal}.${DOMAIN}/magic?token=${accessToken}`,
      }),
      subject: "Your Magic Link",
      to: email,
    };

    return transport.sendMail(mailOptions, (error) => {
      if (error) {
        res.status(404).json({ err: error.message })
      } else {
        res.status(200);
      }
    });

  }
  catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.refresh = async (req, res) => {
  const { refreshToken } = req.headers

  try {
    const { id } = jwt.verify(
      refreshToken,
      `${REFRESH_SECRET}`
    )

    const [user] = await knex
      .table('tokens')
      .where('userId', id)
      .limit(1)

    if (user.activeToken === refreshToken) {
      const accessToken = jwt.sign(
        {
          id: user.userId,
          role: 'user'
        },
        `${SHARED_SECRET}`
      )

      return res.status(200).json({ accessToken })
    }

    return res.status(400).json({ err: 'Token expired' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}

exports.logout = async (req, res) => {
  const { accessToken } = req.headers
  try {
    const { id } = jwt.verify(
      accessToken,
      `${SHARED_SECRET}`
    )
    if (id) {
      await knex
        .table('tokens')
        .where('userId', id)
        .limit(1)
        .delete()
      return res.status(204)
    }
    return res.status(404).json({ err: 'matching user with active session does not exist!' })
  } catch (err) {
    const error = new Error(err)

    return res.status(500).json({ err: error.message })
  }
}
