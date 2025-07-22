const axios = require('axios')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const zipcodes = require('zipcodes')
const getRecommendations = require('./../services/recommendationService');
const getPriceRecommendationInfo = require('./../services/priceEstimatorService');
const { fetchListingsFromDB } = require('../services/fetchRelevantListingsService');
const { getGlobalViewCount } = require('../services/listingDataService');
const { getFavoritedListings, getPopularListings, getRecentlyVisitedListings, getMostDwelledListings, getOwnedListings, getListingFromVIN, deleteListing, updateFavoriteCount, updateUserFavoritedList, sellListing, createListing, getListings } = require('../services/listingService')
const { requireAuth } = require('../middleware/authMiddleware');
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { validateRequest } = require('../middleware/validateMiddleware')
const { searchFilterSchema } = require('../schemas/searchFilterSchema')
const { listingInfoSchema, vinSchema, listingIdSchema, newStatusSchema, priceEstimateSchema, countSchema } = require('../schemas/listingSchema');

const prisma = new PrismaClient()
const listings = express.Router()
listings.use(requireAuth);

/**
 * TODO: make sure the user marking a listing as sold, 
 * deleted, or edited is the owner of the listing
 * 
 * FINAL TODO: hide encrypted password on a get request for a listing?
 */

listings.get('/popular', async (req, res) => {
  logInfo(`Request to get the 20 most popular local listings received`);

  try {
    const popularListings = await getPopularListings();
    res.json(popularListings)
  } catch (error) {
    logError('Error getting popular listings:', error)
    res.status(500).json({ message: 'Error getting popular listings' })
  }
})

listings.post('/', validateRequest({ body: listingInfoSchema }), async (req, res) => {
  const { id: ownerId, zip, name: ownerName, phoneNumber: ownerNumber, latitude, longitude } = req.session.user;

  logInfo(`Request to create a listing for User: ${ownerId} received`);
  
  try {
    const { city, state } = zipcodes.lookup(zip)

    const userInfo = {
      ownerId,
      ownerName,
      ownerNumber,
      city,
      state,
      zip,
      latitude,
      longitude
    }

    const listing = await createListing(req.body, userInfo);
    logInfo('Listing created successfully')
    return res.json(listing);
  } catch (error) {
    logError('Error creating listing:', )
    res.status(500).json({ message: 'Error creating listing' })
  }
})

listings.get('/vin/:vin', validateRequest({ params: vinSchema }), async (req, res) => {
  const vin = req.params.vin;
  logInfo(`Request to get listing with VIN: ${vin} received`);

  try {
    const listing = await getListingFromVIN(vin);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found'})
    }
    res.json(listing)
  } catch (error) {
    logError('Error getting listing from VIN:', )
    res.status(500).json({ message: 'Error getting listing from VIN' })
  }

})

listings.put('/id/:listingId', validateRequest({ body: listingInfoSchema, params: listingIdSchema }), async (req, res) => {
  const listingId = req.params.listingId;

  logInfo(`Request to update local listing with listingId: ${listingId} received`);

  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: req.body
    })

    logInfo(`Local listing with listingId: ${listingId} updated successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/id/:listingId/viewCount', validateRequest({ params: listingIdSchema }), async (req, res) => {
  const listingId = req.params.listingId;

  const response = await getGlobalViewCount(listingId);

  if (response.status === 200) {
    res.json({ viewCount: response.viewCount });
  } else {
    res.status(500).end()
  }
})

listings.delete('/id/:listingId', validateRequest({ params: listingIdSchema }), async (req, res) => {
  const listingId = req.params.listingId;
  logInfo(`Request to delete local listing with listingId: ${listingId} received`);

  try {
    await deleteListing(listingId)
    logInfo(`Local listing with id: ${listingId} deleted successfully`)
    res.status(204).send()
  } catch (error) {
    logError('Error deleting listing:', error);
    res.status(500).json({ message: 'Error deleting listing' });
  }
})

listings.patch('/vin/:vin/favorite', validateRequest({ body: newStatusSchema, params: vinSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const newFavoriteStatus = req.body.newStatus;
  const vin = req.params.vin;

  try {
    if (newFavoriteStatus) {
      // Favorite
      await updateFavoriteCount(vin, 'increment')
      await updateUserFavoritedList(vin, userId, 'connect')
    } else {
      // Unfavorite
      await updateFavoriteCount(vin, 'decrement')
      await updateUserFavoritedList(vin, userId, 'disconnect')
    }
    res.status(204).send()
  } catch (error) {
    logError('Error favoriting listing:', error);
    res.status(500).json({ message: 'Error favoriting listing' })
  }
});

listings.patch('/id/:listingId/sell', validateRequest({ body: newStatusSchema, params: listingIdSchema }), async (req, res) => {
  const newSoldStatus = req.body.newStatus;
  const listingId = req.params.listingId;

  logInfo(`Set sold status of listing with id ${listingId} to ${newSoldStatus}`);

  try {
    await sellListing(listingId, newSoldStatus)
    res.status(204).send();
  } catch (error) {
    logError('Error selling listing:', error);
    res.status(500).json({ message: 'Error selling listing' })
  }
});

listings.get('/favorited', async (req, res) => {
  const userId = req.session.user.id;

  logInfo(`Request to get all favorited local listings for User: ${userId} received`);
  
  try {
    const { favoritedListings } = await getFavoritedListings(userId);
    res.json(favoritedListings)
  } catch (error) {
    logError('Error getting favorited listings:', error)
    res.status(500).json({ message: 'Error getting favorited listings' })
  }
})

listings.get('/most-dwelled/:count', validateRequest( {params: countSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const count = req.params.count;

  try {
    const mostDwelledListingsObjArr = await getMostDwelledListings(userId, count);
    const mostDwelledListings = mostDwelledListingsObjArr.map(item => item.listing);
    res.json(mostDwelledListings)
  } catch (error) {
    logError('Error getting most dwelled listings:', error);
    res.status(500).json({ message: 'Error getting most dwelled listings' })
  }
})

listings.get('/recently-visited/:count', validateRequest( { params: countSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const count = req.params.count;

  try {
    const recentlyVisitedListingsObjArr = await getRecentlyVisitedListings(userId, count);
    const recentlyVisitedListings = recentlyVisitedListingsObjArr.map(item => item.listing);
    res.json(recentlyVisitedListings)
  } catch (error) {
    logError('Error getting recently visited listings:', )
    res.status(500).json({ message: 'Error getting recently visited listings' })
  }
})

listings.get('/owned', async (req, res) => {
  const userId = req.session.user.id

  try {
    const ownedListings = await getOwnedListings(userId);
    res.json(ownedListings);
  } catch (error) {
    logError('Error getting owned listings:', error)
    res.status(500).json({ message: 'Error getting owned listings' })
  }
})

listings.get('/recommended', async (req, res) => {
  const { id: userId, latitude: userLatitude, longitude: userLongitude } = req.session.user;

  try {
    const recommendedListings = await getRecommendations(userId, userLatitude, userLongitude);
    res.json(recommendedListings);
  } catch (error) {
    logError('Error getting recommended listings:', error)
    res.status(500).json({ message: 'Error getting recommended listings' })
  }
})

listings.post('/estimate-price', validateRequest({ body: priceEstimateSchema }), async (req, res) => {
  const { id: sellerId, latitude, longitude } = req.session.user;
  const userInfo = { sellerId, latitude, longitude }

  const userAndListingInfo = { ...userInfo, ...req.body }

  try {
    const priceEsimationInfo = await getPriceRecommendationInfo(userAndListingInfo);
    res.json(priceEsimationInfo)
  } catch (error) {
    logError('Error getting price estimation:', error)
    res.status(500).json({ message: 'Error getting price estimation' })
  }
})

listings.get('/search', validateRequest({ query: searchFilterSchema }), async (req, res) => {
  const { make, model } = req.query;
  logInfo(`Request to get listings for Make: ${make}, Model: ${model} received`);
  
  try {
    const listings = await getListings(req.query);
    res.json(listings);
  } catch (error) {
    logError('Error getting listings:', error)
    res.status(500).json({ message: 'Error getting listings' })
  }
})

listings.get('/vin/:vin/isFavorited', validateRequest({ params: vinSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const vin = req.params.vin;
  logInfo(`Request to check if listing with vin: ${vin} has been favorited by user with id: ${userId} recieved`);

  try {
    const { favoritedListings } = await getFavoritedListings(userId);
    const favoritedListing = favoritedListings.find(listing => listing.vin === vin)
    const favoriteStatus = favoritedListing ? true : false;
    res.json(favoriteStatus)
  } catch (error) {
    logError('Error checking favorite status:', error);
    res.status(500).json({ message: 'Error checking favorite status' });
  }
})

module.exports = listings;