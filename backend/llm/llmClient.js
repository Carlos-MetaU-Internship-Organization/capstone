const { GoogleGenerativeAI } = require('@google/generative-ai')
const dotenv = require('dotenv')
const config = dotenv.config()

const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};
 
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  geminiConfig,
});

module.exports = geminiModel