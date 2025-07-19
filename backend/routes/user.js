const express = require('express')
const user = express.Router()
const { getUserLocation } = require('../services/userService');

user.get('/location', async (req, res) => {
  const userId = req.session.user?.id;
  
  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session '});
  }

  const response = await getUserLocation(userId);

  if (response.status === 200) {
    res.json(response.userLocation);
  } else {
    res.status(500).json({ message: "Failed to retrieve user's location" })
  }
})

module.exports = user;