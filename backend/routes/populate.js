const express = require('express')
const populate = express.Router()
const { populateDBWithMakesAndModels, populateDBWithUsers, populateDBWithListings } = require('./../services/migrationService');

populate.get('/makesAndModels', async (req, res) => {
  const success = await populateDBWithMakesAndModels();
  res.json({ success })
})

populate.get('/users', async (req, res) => {
  await populateDBWithUsers();
  res.json({ success: true });
})

populate.get('/listings', async (req, res) => {
  const success = await populateDBWithListings();
  res.json({ success })
})

module.exports = populate;