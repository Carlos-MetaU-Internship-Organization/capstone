const { logInfo, logWarning, logError } = require('../utils/logging.service');

const express = require('express')
const listings = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
    const listing = await prisma.listing.create({data: {...req.body, userId}});
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
      where: { userId },
      include: {
        user: {
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
      where: { id: listingId },
      select: {
        '*': true,
        // id: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            phoneNumber: true,
            zip: true,
            email: true
          }
        }
      }
    })
    logInfo(`Local listing with id: ${listingId} retrieved successfully`)
    res.json(listing)
  } catch (error) {
    logError('An error occured', error);
    res.json(error);
  }
})

listings.patch('/:listingId', async (req, res) => {
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

module.exports = listings;