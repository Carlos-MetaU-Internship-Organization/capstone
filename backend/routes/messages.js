const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { createMessageSchema, getMessagesSchema } = require('../schemas/messageSchema');
const { createMessage, getConversationHistory, getBuyersAndInfo } = require('../services/messageService');
const { listingIdSchema } = require('../schemas/listingSchema');

const messages = express.Router()
messages.use(requireAuth);

messages.post('/', validateRequest({ body: createMessageSchema }), async (req, res) => {
  const senderId = req.session.user.id;

  try {
    const message = await createMessage({ senderId, ...req.body })
    logInfo('Successfully created message')
    res.json(message);
  } catch (error) {
    logError('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' })
  }  
})

messages.get('/listing/:listingId/otherUser/:otherUserId', validateRequest({ params: getMessagesSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const { listingId, otherUserId } = req.params;

  try {
    const conversationHistory = await getConversationHistory(listingId, userId, otherUserId);
    logInfo('Successfully retrieved conversation history')
    res.json(conversationHistory)
  } catch (error) {
    logError('Error getting conversation history:', error);
    res.status(500).json({ message: 'Error getting conversation history' })
  }  
})

messages.get('/listing/:listingId/buyers', validateRequest({ params: listingIdSchema}), async (req, res) => {
  const sellerId = req.session.user.id;
  const listingId = req.params.listingId;
  
  try {
    const buyersAndInfo = await getBuyersAndInfo(listingId, sellerId)
    res.json(buyersAndInfo)
  } catch (error) {
    logError('Error getting buyers:', error);
    res.status(500).json({ message: 'Error getting buyers' })
  }
})

module.exports = messages;