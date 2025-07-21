const express = require('express')
const { PrismaClient } = require('@prisma/client');
const { fetchPastSearches } = require('../services/fetchRelevantListingsService');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { searchPreferenceSchema } = require('../schemas/searchPreferenceSchema')

const prisma = new PrismaClient()
const preferences = express.Router()
preferences.use(requireAuth);

preferences.post('/favorite', validateRequest({ body: searchPreferenceSchema }), async (req, res) => {
  const userId = req.session.user.id;

  try {
    const existing = await prisma.searchPreference.findFirst({
      where: {
        favoriterId: userId,
        ...req.body
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
        data: { favoriterId: userId, ...req.body}
      })
      return res.json({ preference: newPreference, inDB: true });
    }


  } catch (error) {
    logError('Something bad happened when trying to toggle the favorite status of a search preference', error);
    res.status(500).json({ message: 'Failed to toggle the favorite status of a search preference'})
  }  
})

preferences.get('/favorites', async (req, res) => {
  const userId = req.session.user.id;

  try {
    const searchPreferences = await prisma.searchPreference.findMany({
      where: { favoriterId: userId },
    })

    logInfo(`Successfully retrieved favorited search preferences for userId: ${userId}`)
    res.json(searchPreferences)
  } catch (error) {
    logError('Something bad happened when trying to retrieve favorited search preferences', error);
    res.status(500).json({ message: 'Failed to retrieve favorited search preferences'})
  }  
})

preferences.post('/view', validateRequest({ body: searchPreferenceSchema }), async (req, res) => {
  const userId = req.session.user.id;

  try {
      const existing = await prisma.searchPreference.findFirst({
        where: { viewerId: userId, ...req.body }
      })

      if (existing) {
        logInfo('Record already exists')
        return res.json({
          preference: existing,
          message: 'This record already exists - No new record created'
        })
      }
    
      const viewedPreference = await prisma.searchPreference.create({
        data: { viewerId: userId, ...req.body}
      })

      const recentPreferences = await prisma.searchPreference.findMany({
        where: { viewerId: userId },
        orderBy: { createdAt: 'desc'}
      });

      if (recentPreferences.length > 5) {
        const listingIdToDelete = recentPreferences[5].id;
        await prisma.searchPreference.delete({
          where: { id: listingIdToDelete }
        })
      }

      return res.json({ preference: viewedPreference });
    } catch (error) {
    logError('Something bad happened when trying to create a new search preference', error);
    res.status(500).json({ message: 'Failed to create search preference'})
  }  
})

preferences.get('/viewed', async (req, res) => {
  const userId = req.session.user.id;

  const response = await fetchPastSearches(userId, count);

  if (response.status === 200) {
    res.json(response.searches);
  } else if (response.status === 404) {
    res.status(404).json({ message: response.message })
  } else {
    res.status(500).json({ message: response.message })
  }
})

module.exports = preferences;