const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/authMiddleware');
const { logInfo, logWarning, logError } = require('../utils/logging.service');

const prisma = new PrismaClient()
const messages = express.Router()
messages.use(requireAuth);

messages.post('/', async (req, res) => {
  const senderId = req.session.user.id;
  const { receiverId, content, listingId } = req.body;

  if (!receiverId || !content || !listingId) {
    logWarning('Invalid parameters');
    return res.status(400).json({ message: 'Invalid parameters'});
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        listingId
      }
    })
    
    logInfo(`Successfully created message between between senderId: ${senderId} and receiverId: ${receiverId}`)
    res.json(message);
  } catch (error) {
    logError('Something bad happened when trying to create message', error);
    res.status(500).json({ message: 'Failed to create message'})
  }  
})

messages.get('/listing/:listingId/seller/:sellerId', async (req, res) => {
  const listingId = parseInt(req.params.listingId);
  const sellerId = parseInt(req.params.sellerId);
  const userId = req.session.user.id;

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