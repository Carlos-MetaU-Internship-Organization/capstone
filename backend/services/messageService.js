const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMessage(messageInfo) {
  return prisma.message.create({
    data: { ...messageInfo }
  })
}

async function getConversationHistory(listingId, userId, otherUserId) {
  return prisma.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}

async function getBuyersAndInfo(listingId, sellerId) {
  const messages = await prisma.message.findMany({
    where: {
      listingId,
      receiverId: sellerId
    },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      content: true,
      sender: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  const buyersAndInfo = Object.values(messages.reduce((obj, message) => {
    const senderId = message.sender.id;
    if (!obj[senderId]) {
      obj[senderId] = {
        id: senderId,
        name: message.sender.name,
        content: message.content,
        createdAt: message.createdAt
      }
    }
    return obj
  }, {}))

  return buyersAndInfo;
}

module.exports = {
  createMessage,
  getConversationHistory,
  getBuyersAndInfo
}