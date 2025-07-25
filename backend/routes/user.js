const express = require('express')
const { getUserLocation } = require('../services/userService');
const { requireAuth } = require('../middleware/authMiddleware');

const user = express.Router()
user.use(requireAuth)

user.get('/location', async (req, res) => {
  const userId = req.session.user.id;

  const response = await getUserLocation(userId);

  if (response.status === 200) {
    res.json(response.userLocation);
  } else {
    res.status(500).json({ message: "Failed to retrieve user's location" })
  }
})

module.exports = user;