const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const generateAIContent = require("./servies/generateAIContent.js");
require("dotenv").config();

const token = process.env.TELIGRAM_BOT_API_KEY;
if (!token) {
  console.error('Error: Telegram bot token is missing.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 7000;

// Set webhook URL - replace with your actual domain
const url = process.env.APP_URL || 'https://your-domain.com';
const bot = new TelegramBot(token, {
  webHook: {
    port: port
  }
});

// Set the webhook
bot.setWebHook(`${url}/bot${token}`);

// Handle webhook
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Your existing message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const customPrompt = msg.text;
  console.log("Received message:", customPrompt);
  try {
    console.log('chatId :>> ', chatId);
    bot.sendChatAction(chatId, "typing");
    const generatedContent = await generateAIContent(customPrompt);
    console.log('generated Content', generatedContent);
    await bot.sendMessage(chatId, generatedContent);
  } catch (error) {
    console.error("Error in message handler:", error);
    bot.sendMessage(
      chatId,
      "Sorry, I couldn't process your request. Please try again later."
    );
  }
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Telegram bot is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});