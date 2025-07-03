const { logInfo, logWarning, logError } = require('../utils/logging.service');

const express = require('express')
const listings = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * TODO: put getting userId in try catch block because sometimes
 * req.session.user does not exist..
 * 
 * ALSO TODO: make sure the user marking a listing as sold, 
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
    res.json(error);
  }
})

listings.post('/user/', async (req, res) => {
  const userId = parseInt(req.session.user.id);
  const { condition, make, model, year, color, mileage, vin, description, images, price } = req.body;
  if (!condition || !make || !model || !year || !color || !mileage || !vin || !description || images.length === 0 || !price) {
    logWarning('Listing creation failed: Missing fields.');
    res.json({ status: 400, message: 'Missing fields'})
  }
  // const newListing = req.body;
  // TODO: validate input
  logInfo(`Request to add a local listing for User: ${userId} received`);
  try {
    const listing = await prisma.listing.create({data: {...req.body, ownerId: userId}});
    logInfo('Local listing created successfully')
    res.json(listing);
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

listings.get('/user/', async (req, res) => {
  const userId = parseInt(req.session.user.id);
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
      orderBy: {createdAt: 'desc'}
    })
    logInfo(`All local listings for User: ${userId} retrieved successfully`)
    res.json(listings)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

listings.get('/:listingId', async (req, res) => {
  const listingId = parseInt(req.params.listingId);
  logInfo(`Request to get local listing with listingId: ${listingId} received`);

  try {
    const listing = await prisma.listing.findFirst({
      where: { id: listingId }
    })
    logInfo(`Local listing with id: ${listingId} retrieved successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

listings.put('/:listingId', async (req, res) => {
  const { condition, make, model, year, color, mileage, vin, description, price, sold } = req.body;

  const listingId = parseInt(req.params.listingId);
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
    res.json(error);
  }
})

listings.delete('/:listingId', async (req, res) => {
  // const userId = parseInt(req.session.user.id);
  const listingId = parseInt(req.params.listingId);
  logInfo(`Request to delete local listing with listingId: ${listingId} received`);

  try {
    const listing = await prisma.listing.delete({
      where: { id: listingId }
    })
    logInfo(`Local listing with id: ${listingId} deleted successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

// Increment views column by 1 of a specific listing 
listings.patch('/:listingId/view', async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        views: {
          increment: 1
        }
      }
    });
    res.status(200).send(updated);
  } catch (error) {
    logError('Could not update the view count of this listing.', error);
    res.status(404).send('Listing not found');
  }
});

listings.patch('/:listingId/favorite', async (req, res) => {
  const userId = parseInt(req.session.user.id);
  try {
    const listingId = parseInt(req.params.listingId);

    const listing_found = await prisma.listing.findFirst({
      where: {
        id: listingId,
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
          where: { id: listingId },
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
              disconnect: { id: listingId }
            }
          },
          select: { favoritedListings: true }
        });

    } else {
        // Increment listing's total favorite count
        updated_global_listing = await prisma.listing.update({
          where: { id: listingId },
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
              connect: { id: listingId }
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

  try {
    const listingId = parseInt(req.params.listingId);
    logInfo(`Set sold status of listing with id ${listingId} to ${new_sold_status}`);
    
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

module.exports = listings;