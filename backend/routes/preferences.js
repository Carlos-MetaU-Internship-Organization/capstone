const { logInfo, logWarning, logError } = require('../utils/logging.service');
const express = require('express')
const preferences = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

preferences.post('/favorite', async (req, res) => {
  const data = req.body;
  delete data.sortOption;
  const userId = req.session.user?.id;

  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session'});
  }

  try {
    const existing = await prisma.searchPreference.findFirst({
      where: {
        favoriterId: userId,
        condition: data.condition,
        make: data.make,
        model: data.model,
        distance: data.distance,
        zip: data.zip,
        color: data.color,
        minYear: data.minYear,
        maxYear: data.maxYear,
        maxMileage: data.maxMileage,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
      }
    })

    if (existing) {
      logInfo('Found existing search preference in DB. Time to delete!')
      const deletedPreference = await prisma.searchPreference.delete({
        where: { id: existing.id }
      })
      return res.json({ preference: deletedPreference, inDB: false })
    } else {
      logInfo('No existing search preference in DB. Time to create it!')
      const newPreference = await prisma.searchPreference.create({
        data: { favoriterId: userId, ...data}
      })
      return res.json({ preference: newPreference, inDB: true });
    }


  } catch (error) {
    logError('Something bad happened when trying to create a new search preference', error);
    res.status(500).json({ message: 'Failed to create search preference'})
  }  
})

preferences.get('/favorites', async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session'});
  }

  try {
    const searchPreferences = await prisma.searchPreference.findMany({
      where: { favoriterId: userId },
    })

    logInfo(`Successfully retrieved search preferences for userId: ${userId}`)
    res.json(searchPreferences)
  } catch (error) {
    logError('Something bad happened when trying to retrieve search preferences', error);
    res.status(500).json({ message: 'Failed to retrieve search preferences'})
  }  
})

module.exports = preferences;