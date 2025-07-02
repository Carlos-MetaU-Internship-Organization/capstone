const { logInfo, logWarning, logError } = require('../utils/logging.service');

const express = require('express')
const auth = express.Router()
const { hashPassword, verifyPassword } = require('./argon')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Signup
auth.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, zip, username, password: plainPassword } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {username: username},
        {email: email}
      ]
    }
  })

  if (!user) {
    const hash = await hashPassword(plainPassword);
    const newUser = {name, username, email, zip, phoneNumber, password: hash};
    await prisma.user.create({data: newUser});
    res.json({ status: 200, message: `Welcome, ${name}`});
  } else {
    //TODO: use next
    res.json({ status: 409, message: 'Account already exists' });
  }
})

// Login 
auth.post('/login', async (req, res) => {
  const { login, password: plainPassword } = req.body;

  logInfo('Login request received', { login })
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {username: login},
        {email: login}
      ]
    }
  })

  if (user && (await verifyPassword(plainPassword, user.password))) {
    logInfo('User logged in successfully', { userId: user.id });
    req.session.user = user;
    res.json({ status: 200, message: `Good to see you again, ${user.name}` })
  } else {
    logWarning('Invalid login attempt', { login })
    res.json({ status: 401, message: 'Invalid credentials.' })
  }
})

// Logout
auth.post('/logout', (req, res) => {
  req.session.destroy(error => {
    if (!error) {
      res.json({ message: 'Goodbye.'})
    } else {
      res.json({ message: 'Logout failed' })
    }
  });
})

// Check if they are authenticated
auth.get('/check-auth', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true});
  } else {
    res.json({ authenticated: false});
  }
})

module.exports = auth;