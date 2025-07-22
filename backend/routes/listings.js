const axios = require('axios')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const getRecommendations = require('./../services/recommendationService');
const getPriceRecommendationInfo = require('./../services/priceEstimatorService');
const { fetchLocalListingFromVIN, fetchListingsFromDB } = require('../services/fetchRelevantListingsService');
const { getGlobalViewCount } = require('../services/listingDataService');
const { getFavoritedListings, getPopularListings, getRecentlyVisitedListings, getMostDwelledListings, getOwnedListings } = require('../services/listingService')
const { requireAuth } = require('../middleware/authMiddleware');
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { validateRequest } = require('../middleware/validateMiddleware')
const { searchFilterSchema } = require('../schemas/searchFilterSchema')
const { listingInfoSchema, vinSchema, listingIdSchema, soldStatusSchema, priceEstimateSchema, countSchema } = require('../schemas/listingSchema');

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
  const userId = req.session.user.id

  logInfo(`Request to add a local listing for User: ${userId} received`);
  
  try {
    const { zip, name: owner_name, phoneNumber: owner_number } = await prisma.user.findFirst({
      where: { id: userId },
      select: { name: true, phoneNumber: true, zip: true}
    })

    const apiKey = process.env.CAR_API_KEY;
    const headers = {
      Authorization: `Bearer ${apiKey}`
    };

    const location_info = await axios.get(`https://auto.dev/api/zip/${zip}`, headers);
    let { city, state, latitude, longitude } = location_info.data.payload;

    const listing = await prisma.listing.create({data: {...req.body, ownerId: userId, zip, owner_name, owner_number, city, state, latitude, longitude }});
    
    logInfo('Local listing created successfully')

    return res.json(listing);
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/vin/:vin', validateRequest({ params: vinSchema }), async (req, res) => {
  const vin = req.params.vin;

  logInfo(`Request to get listing with VIN: ${vin} received`);

  const response = await fetchLocalListingFromVIN(vin);

  if (response.status === 200) {
    res.json({ status: 200, listing: response.listing, userId: req.session.user?.id });
  } else if (response.status === 404) {
    res.json({ status: 404, message: response.message })
  } else {
    res.status(500).json({ message: response.message })
  }
})

listings.put('/:listingId', validateRequest({ body: listingInfoSchema, params: listingIdSchema }), async (req, res) => {
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

listings.get('/:listingId/viewCount', validateRequest({ params: listingIdSchema }), async (req, res) => {
  const listingId = req.params.listingId;

  const response = await getGlobalViewCount(listingId);

  if (response.status === 200) {
    res.json({ viewCount: response.viewCount });
  } else {
    res.status(500).end()
  }
})

listings.delete('/:listingId', validateRequest({ params: listingIdSchema }), async (req, res) => {
  const listingId = req.params.listingId;
  
  logInfo(`Request to delete local listing with listingId: ${listingId} received`);

  try {
    const listing = await prisma.listing.delete({
      where: { id: listingId }
    })
    logInfo(`Local listing with id: ${listingId} deleted successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.patch('/:vin/favorite', validateRequest({ params: vinSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const vin = req.params.vin;

  try {
    const listing_found = await prisma.listing.findFirst({
      where: {
        vin,
        favoriters: {
          some: {
            id: userId
          }
        }
      }
    });

    const already_favorited = listing_found ? true : false;
    let updated_global_listing = null;
    let updated_user_listings = null;
    
    if (already_favorited) {
        // Decrement listing's total favorite count
        updated_global_listing = await prisma.listing.update({
          where: { vin },
          data: {
            favorites: {
              decrement: 1
            }
          },
          select: { favorites: true }
        });
        
        // Remove listing from user's favorited listings list
        updated_user_listings = await prisma.user.update({
          where: { id: userId },
          data: {
            favoritedListings: {
              disconnect: { vin }
            }
          },
          select: { favoritedListings: true }
        });

    } else {
        // Increment listing's total favorite count
        updated_global_listing = await prisma.listing.update({
          where: { vin },
          data: {
            favorites: {
              increment: 1
            }
          },
          select: { favorites: true }
        });

        // Add listing to user's favorited listings list
        updated_user_listings = await prisma.user.update({
          where: { id: userId },
          data: {
            favoritedListings: {
              connect: { vin }
            }
          },
          select: { favoritedListings: true }
        });
    }    

    res.status(200).send({
      updated_global_listing,
      updated_user_listings
    });
  } catch (error) {
    logError('Something went wrong trying to favorite the listing', error);
    res.status(404).send('Listing not found')
  }
});

listings.patch('/:listingId/sold', validateRequest({ body: soldStatusSchema, params: listingIdSchema }), async (req, res) => {
  const new_sold_status = req.body.new_sold_status;
  const listingId = req.params.listingId;

  logInfo(`Set sold status of listing with id ${listingId} to ${new_sold_status}`);

  try {
    const updated_global_listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        sold: new_sold_status
      }
    });

    res.status(200).send(updated_global_listing);
  } catch (error) {
    logError('Something went wrong trying to mark the listing as sold/unsold', error);
    res.status(404).send('Listing not found')
  }
});

listings.get('/:vin/data', validateRequest({ params: vinSchema }), async (req, res) => {
  const vin = req.params.vin;

  logInfo(`Request to get information about listing with VIN: ${vin} received`);

  try {
    const apiKey = process.env.CAR_API_KEY;
    const headers = {
      Authorization: `Bearer ${apiKey}`
    };
    const listingData = await axios.get(`https://auto.dev/api/listings/${vin}`, headers);
    logInfo(`Successfully fetched data using Autodev API for listing with VIN: ${vin}`);
    res.json(listingData.data);
  } catch (error) {
    logError(`Something went wrong trying to fetch data using AutoDev API for listing with VIN: ${vin}`, error);
    res.status(500).json({ message: error.message });
  }
})

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
  const { id, latitude, longitude } = req.session.user;

  const userInfo = { sellerId: id, latitude, longitude }

  const userAndListingInfo = { ...userInfo, ...req.body }

  const { marketPrice, recommendedPrice, confidenceLevel, elasticity } = await getPriceRecommendationInfo(userAndListingInfo);

  res.json({ status: 200, marketPrice, recommendedPrice, confidenceLevel, elasticity });
})

listings.get('/search', validateRequest({ query: searchFilterSchema }), async (req, res) => {
  const { make, model } = req.query;

  logInfo(`Request to get listings for Make: ${make}, Model: ${model} received`);
  
  const response = await fetchListingsFromDB(req.query);
  
  if (response.status === 200) {
    res.json(response.listings);
  } else if (response.status === 404) {
    res.status(404).json({ message: response.message })
  } else {
    res.status(500).json({ message: response.message })
  }
})

module.exports = listings;