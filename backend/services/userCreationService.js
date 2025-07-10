const { logInfo, logError } = require('../utils/logging.service');
const { hashPassword } = require('./passwordService')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const getLatitudeLongitude = require('./geoService')

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

    const { latitude, longitude} = await getLatitudeLongitude(zip);

    const newUser = {name, username, email, zip, latitude, longitude, phoneNumber, password: hash};
    try {
      const dbUser = await prisma.user.create({data: newUser});
      logInfo(`Created user with Id: ${dbUser.id}`)
      return { status: 200, newUser: dbUser };
    } catch (error) {
      logError('Failed to create user', error)
      return { status: 500 }
    }
  } else {
    return { status: 409 };
  }
}

module.exports = signupUser;