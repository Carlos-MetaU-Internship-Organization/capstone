const axios = require('axios')
const { logInfo, logError } = require('./loggingService')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getMakesAndModels() {
  try {
    const makesAndModelsResponse = await axios.get('https://auto.dev/api/models');
    logInfo('Successfully retrieved makes and models using Auto Dev API')
    return { status: 200, data: makesAndModelsResponse.data }
  } catch (error) {
    logError('Error when retrieving makes and models using Auto Dev API', error)
    return { status: 500 }
  }
}

async function insertMakesAndModels(makesAndModels) {
  try {
    await Promise.all(makesAndModels.map(async (makeData) => {
      const make = await prisma.make.create({
        data: {
          name: makeData.name,
          models: {
            create: makeData.models.map((model) => ({ name: model.name })),
          }
        }
      })
   }))
   logInfo('Successfully inserted makes and models into DB')
   return { status: 200 }
  } catch (error) {
    logError('Error when inserting makes and models into DB', error)
    return { status: 500 }
  }
}

module.exports = { getMakesAndModels, insertMakesAndModels }