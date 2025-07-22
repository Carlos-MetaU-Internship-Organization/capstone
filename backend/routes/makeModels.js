const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { makeSchema } = require('../schemas/makeModelSchema');
const { getMakes, getModels } = require('../services/makeModelService');

const prisma = new PrismaClient()
const makeModels = express.Router()
makeModels.use(requireAuth)

makeModels.get('/makes', async (req, res) => {
  logInfo('Request to get all makes received');

  try {
    const makes = await getMakes()
    res.json(makes);
  } catch (error) {
    logError('Error getting makes:', error);
    res.status(500).json({ message: 'Error getting makes' });
  }
})

makeModels.get('/:make/models', validateRequest({ params: makeSchema }), async (req, res) => {
  const make = req.params.make;
  logInfo(`Request to get all models for Make: ${make} received`);

  try {
    const models = await getModels(make);
    res.json(models)
  } catch (error) {
    logError('Error getting models', error);
    res.status(500).json(error);
  }
})

module.exports = makeModels;