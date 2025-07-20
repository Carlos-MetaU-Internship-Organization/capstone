const axios = require('axios')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const getRecommendations = require('./../services/recommendationService');
const getPriceRecommendationInfo = require('./../services/priceEstimatorService');
const { fetchLocalListingFromVIN } = require('../services/fetchRelevantListingsService');
const { getGlobalViewCount } = require('../services/listingDataService');
const { requireAuth } = require('../middleware/authMiddleware');
const { logInfo, logWarning, logError } = require('../utils/logging.service');

const prisma = new PrismaClient()
const listings = express.Router()
listings.use(requireAuth);

/**
 * TODO: make sure the user marking a listing as sold, 
 * deleted, or edited is the owner of the listing
 * 
 * FINAL TODO: hide encrypted password on a get request for a listing?
 */

listings.get('/', async (req, res) => {
  logInfo(`Request to get all local listings received`);

  try {
    const listings = await prisma.listing.findMany();
    logInfo('All local listings retrieved successfully')
    res.json(listings)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/popular', async (req, res) => {
  logInfo(`Request to get the 20 most viewed local listings received`);

  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        visits: {
          _count: 'desc'
        }
      },
      take: 20
    });
    logInfo('The 20 most viewed local listings retrieved successfully')
    res.json(listings)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }

})

listings.post('/', async (req, res) => {
  const userId = parseInt(req.session.user.id)

  let { condition, make, model, year, color, mileage, vin, description, images, price, zip = '', owner_name = '', owner_number = '', city = '', state = '', latitude = 0, longitude = 0, createdAt = '', views = 0 } = req.body;
  if (!condition || !make || !model || !year || !color || !mileage || !vin || !description || images.length === 0 || !price) {
    logWarning('Listing creation failed: Missing fields.');
    return res.json({ status: 400, message: 'Missing fields'})
  }

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

listings.get('/user/', async (req, res) => {
  const userId = parseInt(req.session.user.id)

  logInfo(`Request to get all local listings for User: ${userId} received`);

  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            phoneNumber: true,
            zip: true,
            email: true
          }
        }
      },
      orderBy: [
        { sold: 'asc'},
        { createdAt: 'desc' }
      ]
    })
    logInfo(`All local listings for User: ${userId} retrieved successfully`)
    res.json(listings)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/vin/:vin', async (req, res) => {
  const vin = req.params.vin;
  
  if (!vin) {
    logWarning('No VIN provided');
    return res.status(400).json({ message: 'Invalid VIN'});
  }

  logInfo(`Request to get local listing with VIN: ${vin} received`);

  const response = await fetchLocalListingFromVIN(vin);

  if (response.status === 200) {
    res.json({ status: 200, listing: response.listing, userId: req.session.user?.id });
  } else if (response.status === 404) {
    res.json({ status: 404, message: response.message })
  } else {
    res.status(500).json({ message: response.message })
  }
})

listings.put('/:listingId', async (req, res) => {
  const { condition, make, model, year, color, mileage, vin, description, price, sold } = req.body;

  const listingId = parseInt(req.params.listingId);
  if (!listingId) {
    logWarning('No listingId provided');
    return res.status(400).json({ message: 'Invalid listingId'});
  }

  logInfo(`Request to update local listing with listingId: ${listingId} received`);

  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        condition,
        make,
        model,
        year,
        color,
        mileage,
        vin,
        description,
        price,
        sold
      }
    })

    logInfo(`Local listing with listingId: ${listingId} updated successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/:listingId/viewCount', async (req, res) => {
  const listingId = parseInt(req.params.listingId);

  if (!listingId) {
    logWarning('No listingId provided');
    return res.status(400).json({ message: 'Invalid listingId'});
  }

  const response = await getGlobalViewCount(listingId);

  if (response.status === 200) {
    res.json({ viewCount: response.viewCount });
  } else {
    res.status(500).end()
  }
})

listings.delete('/:listingId', async (req, res) => {
  const listingId = parseInt(req.params.listingId);

  if (!listingId) {
    logWarning('No listingId provided');
    return res.status(400).json({ message: 'Invalid listingId'});
  }
  
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

listings.patch('/:vin/favorite', async (req, res) => {
  const userId = parseInt(req.session.user.id);
  const vin = req.params.vin;

  if (!vin) {
    logWarning('No VIN provided');
    return res.status(400).json({ message: 'Invalid VIN'});
  }

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

listings.patch('/:listingId/sold', async (req, res) => {
  const { new_sold_status } = req.body;
  const listingId = parseInt(req.params.listingId);
  
  if (new_sold_status === undefined) {
    logWarning('No sold status provided');
    return res.status(400).json({ message: 'Invalid sold status'});
  }

  if (!listingId) {
    logWarning('No listingId provided');
    return res.status(400).json({ message: 'Invalid listingId'});
  }

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

listings.get('/:vin/data', async (req, res) => {
  const vin = req.params.vin;

  if (!vin) {
    logWarning('No VIN provided');
    return res.status(400).json({ message: 'Invalid VIN'});
  }

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

listings.get('/user/favorited', async (req, res) => {
  const userId = parseInt(req.session.user.id);

  logInfo(`Request to get all favorited local listings for User: ${userId} received`);

  try {
    const favoritedListings = await prisma.user.findFirst({
      where: { id: userId },
      select: { favoritedListings: true }
    })
    logInfo(`All favorited local listings for User: ${userId} retrieved successfully`)
    res.json(favoritedListings)
  } catch (error) {
    logError('An error occured', error);
    res.status(500).json({ message: error.message });
  }
})

listings.get('/recommended', async (req, res) => {
  const userId = req.session.user.id;
  const userLatitude = req.session.user?.latitude;
  const userLongitude = req.session.user?.longitude;

  const recommendedListings = await getRecommendations(userId, userLatitude, userLongitude);
  res.json(recommendedListings);
})

listings.post('/estimate-price', async (req, res) => {
  const userId = req.session.user.id;
  const { condition, make, model, year, mileage } = req.body;

  if (!condition || !make || !model || !year || !mileage) {
    logWarning('Listing price generation failed: Missing fields.');
    return res.json({ status: 400, message: 'Missing fields'})
  }

  const { latitude, longitude } = req.session.user;

  const userInfo = { sellerId: userId, latitude, longitude }
  
  const userListingInfo = { condition, make, model, year, mileage }

  const allUserInfo = { ...userInfo, ...userListingInfo }

  const { marketPrice, recommendedPrice, confidenceLevel, elasticity } = await getPriceRecommendationInfo(allUserInfo);

  res.json({ status: 200, marketPrice, recommendedPrice, confidenceLevel, elasticity });
})

module.exports = listings;