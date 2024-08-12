// aiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function generateAIContent(prompt = "give 200 word essay about cow") {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent([prompt]);
    console.log('result :>> ', result.response);
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

module.exports = generateAIContent;