// aiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function generateAIContent(prompt = "give 200 word essay about cow") {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
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
  try {
    const result = await chat.startChat(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

module.exports = generateAIContent;