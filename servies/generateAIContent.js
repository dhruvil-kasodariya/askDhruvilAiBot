// aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Store chats for different users
const userChats = new Map();

async function generateAIContent(prompt, chatId) {  // Add chatId parameter
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Get existing chat or create new one
  if (!userChats.has(chatId)) {
    const newChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
    });
    userChats.set(chatId, newChat);
  }
  
  const chat = userChats.get(chatId);
  
  try {
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

// Add function to clear chat history if needed
function clearChatHistory(chatId) {
  userChats.delete(chatId);
}

module.exports = { generateAIContent, clearChatHistory };