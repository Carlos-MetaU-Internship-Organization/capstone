const { logInfo, logWarning, logError } = require('../utils/logging.service');
const express = require('express')
const recommendations = express.Router()

recommendations.get('/', async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session'});
  }
  
})

module.exports = recommendations;