const express = require('express')
const zipcodes = require('zipcodes')
const { hashPassword, verifyPassword } = require('./../services/passwordService')
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { signupSchema, loginSchema } = require('../schemas/authSchema');
const { findUserByCredentials, createUser } = require('../services/userService');

const auth = express.Router()

// Signup
auth.post('/signup', validateRequest({ body: signupSchema }), async (req, res) => {
  const { name, email, zip, username, password: plainPassword } = req.body;
  const user = await findUserByCredentials({ username, email })

  if (!user) {
    const hashedPassword = await hashPassword(plainPassword);

    const { latitude, longitude } = zipcodes.lookup(zip);

    const userInfo = {
      ...req.body,
      password: hashedPassword,
      latitude,
      longitude
    }

    await createUser(userInfo);

    return res.json({ message: `Welcome, ${name}`});
  }

  res.status(409).json({ message: 'Account already exists. Please log in below.' });
})

// Login 
auth.post('/login', validateRequest({ body: loginSchema }), async (req, res) => {
  const { login, password: plainPassword } = req.body;

  logInfo('Login request received', login)
  const user = await findUserByCredentials({ username: login, email: login })

  if (user && (await verifyPassword(plainPassword, user.password))) {
    logInfo('User logged in successfully', { userId: user.id });
    req.session.user = user;
    return res.json({ message: `Good to see you again, ${user.name}` })
  }

  logWarning('Invalid login attempt', { login })
  res.status(401).json({ message: 'Invalid credentials.' })
})

// Logout
auth.post('/logout', (req, res) => {
  req.session.destroy(error => {
    if (!error) {
      return res.json({ message: 'Goodbye.' })
    }
    
    res.status(500).json({ message: 'Logout failed.' })
  });
})

// Check if they are authenticated
auth.get('/check-auth', (req, res) => {
  const user = req.session?.user;

  if (user) {
    return res.json({ id: user.id });
  }

  res.status(401).json({ message: 'Please log in below.' });
})

module.exports = auth;