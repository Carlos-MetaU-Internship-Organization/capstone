const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { makeSchema } = require('../schemas/makeModelSchema');

const prisma = new PrismaClient()
const makeModels = express.Router()
makeModels.use(requireAuth)

makeModels.get('/makes', async (req, res) => {
  logInfo('Request to get all makes received');
  try {
    const makes = await prisma.make.findMany({
      select: {name: true},
      orderBy: {name: 'asc'}
    }
    );
    logInfo('All makes retrieved successfully')
    res.json(makes);
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

makeModels.get('/:make/models', validateRequest({ params: makeSchema }), async (req, res) => {

  const make = req.params.make;

  logInfo(`Request to get all models for Make: ${make} received`);

  try {
    const make = req.params.make;
    const models = await prisma.model.findMany({
      where: { makeName: make },
      select: { name: true },
      orderBy: {name: 'asc'}
    })
    logInfo('All models retrieved successfully')
    res.json(models)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

module.exports = makeModels;