const express = require('express')
const populate = express.Router()
const { populateDBWithUsers } = require('./../services/migrationService');

populate.get('/users', async (req, res) => {
  await populateDBWithUsers();
  res.json({ success: true });
})

module.exports = populate;