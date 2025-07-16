const path = require('path')
const createRandomUser = require('../utils/fakeUserGenerator')
const { getMakesAndModels, insertMakesAndModels } = require('./makeModelService')
const { fetchListingsForMigration, fetchMakeModelCombinations, createListing } = require('./listingService')
const { signupUser, getAllNeededUserInfo } = require('./userService')
const { logInfo } = require('./../utils/logging.service')
const { logError } = require('../../frontend/src/utils/logging.service')
const { writeFile } = require('fs').promises
const { NUMBER_OF_FAKE_USERS, BATCH_SIZE, RATIO_OF_SOLD_LISTINGS } = require('../utils/constants')

async function populateDBWithMakesAndModels() {
  const makesAndModelsResponse = await getMakesAndModels();
  const makesAndModelsData = makesAndModelsResponse.data;
  if (makesAndModelsResponse.status !== 200) {
    return false;
  }

  const makesAndModels = Object.keys(makesAndModelsData).map((make) => ({
    name: make,
    models: makesAndModelsData[make].map((model) => ({ name: model }))
  }))

  const makesAndModelsInsertionResponse = await insertMakesAndModels(makesAndModels);
  if (makesAndModelsInsertionResponse.status !== 200) {
    return false;
  }
  return true;
}

async function populateDBWithUsers() {
  const users = [];
  for (let i = 0; i < NUMBER_OF_FAKE_USERS; i++) {
    const randomUserInfo = createRandomUser();
    const newUser = (await signupUser(randomUserInfo)).newUser;
    if (newUser) {
      users.push(newUser);
    }
  }
  logInfo(`Successfully created ${users.length} users`)
  const filePath = path.join(__dirname, './../data/users.json')
  await writeToFile(filePath, JSON.stringify(users, null, 2));
  return users.length > 0
}

async function populateDBWithListings() {

  const allNeededUserInfoResponse = await getAllNeededUserInfo();
  if (allNeededUserInfoResponse.status !== 200) {
    return false;
  }

  const makeModelCombinations = (await fetchMakeModelCombinations()).makeModelCombinations;
  const count = { numListingsCreated: 0 };

  for (let i = 0; i < makeModelCombinations.length; i += BATCH_SIZE) {
    const makeModelCombinationBatch = makeModelCombinations.slice(i, i + BATCH_SIZE);
    const listingsResponse = await fetchListingsForMigration(makeModelCombinationBatch);
    if (listingsResponse.status !== 200) {
      return false;
    }

    const listings = listingsResponse.listings;
    const allUserInfo = allNeededUserInfoResponse.allNeededUserInfo;
  
    for (const listing of listings) {
      const randomUserIndex = Math.floor(Math.random() * (allUserInfo.length));
      const soldStatus = Math.random() <= RATIO_OF_SOLD_LISTINGS;
      if ((await createListing(allUserInfo[randomUserIndex], listing, soldStatus)).listing) {
        count.numListingsCreated++;
      }
    }

  }
  


  logInfo(`Successfully created ${count.numListingsCreated} listings in the database`);
  return count.numListingsCreated > 0
}

async function writeToFile(filename, content) {
  try {
    await writeFile(filename, content);
    logInfo(`Successfully wrote content to ${filename}`)
  } catch (error) {
    logError(`Error writing content to file ${filename}`, error)
  }
}

module.exports = { populateDBWithMakesAndModels, populateDBWithUsers, populateDBWithListings };