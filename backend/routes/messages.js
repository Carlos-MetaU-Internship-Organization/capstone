const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware')
const { logInfo, logWarning, logError } = require('../services/loggingService');
const { createMessageSchema, getMessagesSchema } = require('../schemas/messageSchema');
const { createMessage, getConversationHistory } = require('../services/messageService');

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

messages.get('/listing/:listingId/seller/:sellerId', validateRequest({ params: getMessagesSchema }), async (req, res) => {
  const userId = req.session.user.id;
  const { listingId, sellerId } = req.params;

  try {
    const messages = await getConversationHistory(listingId, sellerId, userId);
    logInfo('Successfully retrieved conversation history')
    res.json(messages)
  } catch (error) {
    logError('Error getting conversation history:', error);
    res.status(500).json({ message: 'Error getting conversation history' })
  }  
})

module.exports = messages;