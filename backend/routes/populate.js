const express = require('express')
const { populateDBWithMakesAndModels, populateDBWithUsers, populateDBWithListings } = require('./../services/migrationService');
const { requireMasterUser } = require('./../middleware/authMiddleware');

const populate = express.Router()
populate.use(requireMasterUser);

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