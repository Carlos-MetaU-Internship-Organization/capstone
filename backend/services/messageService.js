const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMessage(messageInfo) {
  return prisma.message.create({
    data: { ...messageInfo }
  })
}

async function getConversationHistory(listingId, sellerId, userId) {
  return prisma.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: sellerId, receiverId: userId },
        { senderId: userId, receiverId: sellerId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}

module.exports = {
  createMessage,
  getConversationHistory
}