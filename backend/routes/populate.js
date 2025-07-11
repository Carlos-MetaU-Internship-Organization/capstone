const express = require('express')
const populate = express.Router()
const { populateDBWithUsers, populateDBWithListings } = require('./../services/migrationService');

populate.get('/users', async (req, res) => {
  await populateDBWithUsers();
  res.json({ success: true });
})

populate.get('/listings', async (req, res) => {
  const success = await populateDBWithListings();
  res.json({ success })
})

module.exports = populate;