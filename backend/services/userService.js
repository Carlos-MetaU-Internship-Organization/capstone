const zipcodes = require('zipcodes')
const { logInfo, logError } = require('../utils/logging.service')
const { hashPassword } = require('./passwordService')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function signupUser(userInfo) {
  const { name, email, phoneNumber, zip, username, password: plainPassword } = userInfo;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {username: username},
        {email: email}
      ]
    }
  })

  if (!user) {
    const hash = await hashPassword(plainPassword);

    const { latitude, longitude } = zipcodes.lookup(zip);

    const newUser = {name, username, email, zip, latitude, longitude, phoneNumber, password: hash};
    try {
      const dbUser = await prisma.user.create({data: newUser});
      const userToSave = { ...dbUser, password: plainPassword }
      logInfo(`Created user with Id: ${dbUser.id}`)
      return { status: 200, newUser: userToSave };
    } catch (error) {
      logError('Failed to create user', error)
      return { status: 500 }
    }
  } else {
    return { status: 409 };
  }
}

/**
 * Get all users' id, name, email, and phone number (needed to display on listing)
 */
async function getAllNeededUserInfo() {
  try {
    const allNeededUserInfo = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true
      }
    })

    logInfo("Successfully retrieved every users' id, name, email, and phone number")
    return { status: 200, allNeededUserInfo }
  } catch (error) {
    logError("Error trying to retrieve every users' id, name, email, and phone number")
    return { status: 500 }
  }
}

async function getUserLocation(userId) {
  try {
    const userLocation = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        zip: true,
        latitude: true,
        longitude: true
      }
    })

    logInfo("Successfully retrieved user's location ")
    return { status: 200, userLocation }
  } catch (error) {
    logError(`Error trying to retrieve the location of user with userId: ${userId}`)
    return { status: 500 }
  }
}

module.exports = { signupUser, getAllNeededUserInfo, getUserLocation }