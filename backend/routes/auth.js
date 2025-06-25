const express = require('express')
const auth = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Signup
auth.post('/signup', async (req, res) => {
  const { username, password: plainPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: {username}
  })

  if (!user) {
    const hash = await hashPassword(plainPassword);
    const newUser = {username, password: hash};
    await prisma.user.create({data: newUser});
    res.json({ message: `Welcome, ${username}`});
  } else {
    next({ status: 409, message: 'Username taken' });
  }
})

// Login 
auth.post('/login/', async (req, res) => {
  const { username, password: plainPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: {username}
  })

  if (user && (await verifyPassword(plainPassword, user.password))) {
    req.session.user = user;
    res.json({ message: `Good to see you again, ${username}` })
  } else {
    next({ status: 401, message: 'Invalid credentials.' })
  }

})
