const { logInfo, logWarning, logError } = require('../utils/logging.service');
const axios = require('axios')
const express = require('express')
const track = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

track.post('/dwell', async (req, res) => {
  let { listingId, dwellTime } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session'});
  }

  if (!listingId || dwellTime == '0') {
    logWarning('Invalid parameters');
    return res.status(400).json({ message: 'Invalid parameters'});
  }

  try {
    const prev_visit = await prisma.listingVisit.findFirst({
      where: { userId, listingId }
    })

    if (prev_visit) {
      await prisma.listingVisit.update({
        where: { id: prev_visit.id },
        data: {
          dwellTime: prev_visit.dwellTime + dwellTime,
          visitedAt: new Date()
        }
      })
    } else {
      await prisma.listingVisit.create({
        data: { userId, listingId, dwellTime }
      })
    }

    logInfo(`Successfully tracked ${dwellTime} seconds of dwell time for listingId: ${listingId} and userId: ${userId}`)
    res.json({ message: 'Successfully tracked dwell time.'})
  } catch (error) {
    logError('Something bad happened when trying to save dwell time', error);
    res.status(500).json({ message: 'Failed to save dwell time '})
  }  
})

track.get('/most-dwelled-listings', async (req, res) => {
  const userId = req.session.user?.id;
  
  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session '});
  }

  try {
    const topVisits = await prisma.listingVisit.findMany({
      where: { userId },
      orderBy: { dwellTime: 'desc' },
      take: 10,
      include: { listing: true }
    })

    if (!topVisits) {
      return res.status(400).json({ message: `User with Id: ${userId} has no previous visits` });
    }

    res.json(topVisits);
  } catch (error) {
    logError('Something bad happened trying to fetch most-dwelled listings', error);
    res.status(500).json({ message: 'Failed to retrieve 10 listings with highest dwell time'})
  }
})

track.get('/most-recently-visited-listings', async (req, res) => {
  const userId = req.session.user?.id;
  
  if (!userId) {
    logWarning('Invalid session');
    return res.status(401).json({ message: 'Invalid session '});
  }

  try {
    const mostRecentVisits = await prisma.listingVisit.findMany({
      where: { userId },
      orderBy: { visitedAt: 'desc' },
      take: 20,
      include: { listing: true }
    })

    if (!mostRecentVisits) {
      return res.status(400).json({ message: `User with Id: ${userId} has no previous visits` });
    }

    res.json(mostRecentVisits);
  } catch (error) {
    logError('Something bad happened trying to fetch most-recently-visited listings', error);
    res.status(500).json({ message: 'Failed to retrieve the 20 most-recently visited listings'})
  }
})

module.exports = track;