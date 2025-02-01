const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const userSessions = new Map();

async function generateAIContent(prompt, chatId, language) {  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      chat: model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `I need help with ${language} programming` }],
          },
          {
            role: "model",
            parts: [{ text: `Ready to assist you with ${language}. What do you need help with?` }],
          },
        ],
      }),
      language: language
    });
  }
  
  const session = userSessions.get(chatId);
  const enhancedPrompt = `Assist me with ${language} programming: ${prompt}`;
  console.log('enhancedPrompt', enhancedPrompt)
  
  try {
    const result = await session.chat.sendMessage(enhancedPrompt);
    let responseText =await result.response.text();
      // Format for Telegram's MarkdownV2 format
      responseText = responseText
      // Escape special characters for Telegram MarkdownV2
      .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
      // Format inline code
      .replace(/`([^`]+)`/g, '\\`$1\\`')
      
      // Format bullet points (using • instead of *)
      .replace(/\n\* /g, '\n• ')
      
      // Format numbered lists (ensure proper spacing)
      .replace(/\n(\d+)\. /g, '\n$1\\. ')
      
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      
      // Trim any trailing whitespace
      .trim();

   console.log('responseText :>> ', responseText);
    return responseText;
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

function clearChatHistory(chatId) {
  userSessions.delete(chatId);
}

module.exports = { generateAIContent, clearChatHistory };