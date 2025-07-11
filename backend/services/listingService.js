const axios = require('axios')
const gps = require('gps2zip')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError, logWarning } = require('../../frontend/src/utils/logging.service');
const levenshtein = require('js-levenshtein');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

// const CAR_API_KEY = process.env.CAR_API_KEY;
const PAGE_SIZE = 20;
const FIVE_PERCENT = 0.05;
const MIN_LISTINGS_TO_FETCH = 40;

async function fetchListingsForMigration() {
  const makeModelCombinations = (await fetchMakeModelCombinations()).makeModelCombinations;

  const allListings = [];

  for (const makeModelCombination of makeModelCombinations) {
    const make = makeModelCombination.makeName;
    const model = makeModelCombination.name;

    const page1 = await fetchPage(make, model, 1);
    const cleanedPage1Listings = cleanResultsFromAPI(page1.listings);
    allListings.push(...cleanedPage1Listings)
    
    const numberOfListings = page1.numberOfListings;

    if (numberOfListings > 20) {
      const howManyToFetch = Math.max(MIN_LISTINGS_TO_FETCH, Math.ceil(numberOfListings * FIVE_PERCENT));
  
      const pagesToFetch = [];
      for (let page = 2; page <= Math.ceil(howManyToFetch / PAGE_SIZE); page++) {
        pagesToFetch.push(page);
      }
  
      const results = await Promise.all(
        pagesToFetch.map(page => fetchPage(make, model, page))
      )
  
      results.forEach(pageResult => {
        const cleanedPageResults = cleanResultsFromAPI(pageResult.listings)
        allListings.push(...cleanedPageResults)
      });
    }
  }

  const status = allListings.length > 0 ? 200 : 500;
  logInfo(`Successfully retrieved ${allListings.length} listings using Auto Dev API`)
  return { status, listings: allListings };
}

function cleanResultsFromAPI(listings) {
  cleanedResults = []; 

  for (const listing of listings) {
    const cleanedListing =  {
      vin: listing.vin,
      condition: listing.condition,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      color: getClosestColor(listing.displayColor),
      mileage: listing.mileageUnformatted,
      images: listing.photoUrls,
      price: listing.priceUnformatted,
      zip: gps.gps2zip(listing.lat, listing.lon).zip_code,
      latitude: listing.lat,
      longitude: listing.lon,
      city: listing.city,
      state: listing.state
    }
    cleanedResults.push(cleanedListing);
  }

  return cleanedResults;
}

function getClosestColor(inputColor) {
  if (!inputColor) return "";

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];
  
  let closestColor = null;
  let minDistance = Infinity;
  colors.forEach(color => {
    const distance = levenshtein(inputColor.toLowerCase(), color);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  })

  return closestColor;
}

async function fetchMakeModelCombinations() {
  try {
    const makeModelCombinations = await prisma.model.findMany({
      select: {
        makeName: true,
        name: true
      }
    })
    logInfo('Successfully retrieved all make & model combinations')
    return { status: 200, makeModelCombinations }
  } catch (error) {
    logError('Error trying to retrieve all make & model combinations')
    return { status: 500 }
  }
}

async function fetchPage(make, model, page) {
  const url = `https://auto.dev/api/listings?make=${make}&model=${model}&page=${page}&exclude_no_price=true`;

  try {
    const response = await axios.get(url)

    if (response.status !== 200) {
      logWarning('Auto Dev API retrived status ${response.status}')
      return { listings: [], numberOfListings: 0 }
    }

    logInfo(`Successfully fetched ${response.data.hitsCount} listings for Make: ${make} Model: ${model}. There are ${response.data.totalCount} total.`)
    return { listings: response.data.records, numberOfListings: response.data.totalCount }
  } catch (error) {
    logError('Error during listing retrieval using Auto Dev API', error)
    return { listings: [], numberOfListings: 0 }
  }
}

async function createListing(userInfo, listingInfo, soldStatus) {
  logInfo(`Request to add a listing for User: ${userInfo.id} received`);

  // TODO: add email

  const formatOrNA = field => field != null ? field.toString() : 'N/A'

  const listing = {
    vin: listingInfo.vin,
    condition: formatOrNA(listingInfo.condition),
    make: formatOrNA(listingInfo.make),
    model: formatOrNA(listingInfo.model),
    year: formatOrNA(listingInfo.year),
    color: formatOrNA(listingInfo.color),
    mileage: formatOrNA(listingInfo.mileage),
    description: formatOrNA(listingInfo.description),
    images: listingInfo.images || 'https://shnack.com/images/no_photo.jpg',
    price: formatOrNA(listingInfo.price),
    zip: listingInfo.zip.toString(),
    latitude: listingInfo.latitude,
    longitude: listingInfo.longitude,
    city: formatOrNA(listingInfo.city),
    state: formatOrNA(listingInfo.state),
    owner_name: userInfo.name,
    owner_number: userInfo.phoneNumber,
    ownerId: userInfo.id,
    sold: soldStatus
  }

  try {
    const createdListing = await prisma.listing.create({
      data: listing
    })
    
    logInfo('Listing created successfully')
    return { status: 200, listing: createdListing }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      logError('Duplicate VIN detected');
      return { status: 400, message: 'VIN already exists' }
    }
    logError('An error occured', error);
    return { status: 500 }
  }
}

module.exports = { fetchListingsForMigration, createListing }