const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../utils/logging.service');
const { createMessageSchema, getMessagesSchema } = require('../schemas/messageSchema')

const prisma = new PrismaClient()
const messages = express.Router()
messages.use(requireAuth);

messages.post('/', validateRequest({ body: createMessageSchema }), async (req, res) => {
  const senderId = req.session.user.id;

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        ...req.body
      }
    })
    
    logInfo(`Successfully created message between between senderId: ${senderId} and receiverId: ${receiverId}`)
    res.json(message);
  } catch (error) {
    logError('Something bad happened when trying to create message', error);
    res.status(500).json({ message: 'Failed to create message'})
  }  
})

messages.get('/listing/:listingId/seller/:sellerId', validateRequest({ params: getMessagesSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const { listingId, sellerId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: sellerId, receiverId: userId },
          { senderId: userId, receiverId: sellerId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    logInfo(`Successfully retrieved messages between between userId: ${userId} and sellerId: ${sellerId}`)
    res.json(messages)
  } catch (error) {
    logError('Something bad happened when trying to retrieve messages', error);
    res.status(500).json({ message: 'Failed to retrieve messages'})
  }  
})

module.exports = messages;