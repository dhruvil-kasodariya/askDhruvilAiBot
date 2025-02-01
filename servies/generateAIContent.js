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
   // Format the response text with proper spacing and markdown
   responseText = responseText
   // Add proper spacing for headings
   .replace(/\n(#{1,6}\s)/g, '\n\n$1')
   
   // Add proper spacing for bullet points
   .replace(/\n([*-])/g, '\n\n$1')
   
   // Add proper spacing for numbered lists
   .replace(/\n(\d+\.)/g, '\n\n$1')
   
   // Add proper spacing for code blocks
   .replace(/\n(```[^\n]*)/g, '\n\n$1')
   .replace(/\n(```\s*)$/gm, '\n\n$1\n')
   
   // Add proper spacing after code blocks
   .replace(/(```)\n(?![\n#*\d])/g, '$1\n\n')
   
   // Format inline code
   .replace(/`([^`]+)`/g, '`$1`')
   
   // Ensure proper spacing around bold/italic text
   .replace(/\*\*(.*?)\*\*/g, '**$1**')
   .replace(/\*(.*?)\*/g, '*$1*')
   
   // Remove excessive blank lines (more than 2)
   .replace(/\n{3,}/g, '\n\n')
   
   // Ensure proper spacing around paragraphs
   .replace(/([.!?])\n(?!\n)/g, '$1\n\n')
   
   // Clean up any remaining formatting issues
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