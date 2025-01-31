const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const { generateAIContent, clearChatHistory } = require("./servies/generateAIContent.js");
require("dotenv").config();

const token = process.env.TELIGRAM_BOT_API_KEY;
if (!token) {
  console.error('Error: Telegram bot token is missing.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 7000;

// Add options for polling
const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Add error handling middleware
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error.code === 'EFATAL') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Your existing message handler
// Your message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const customPrompt = msg.text;
  console.log("Received message:", customPrompt);
  
  // Handle /reset command to clear chat history
  if (customPrompt === '/reset') {
    clearChatHistory(chatId);
    await bot.sendMessage(chatId, "Chat history has been reset!");
    return;
  }
  
  try {
    console.log('chatId :>> ', chatId);
    bot.sendChatAction(chatId, "typing");
    const generatedContent = await generateAIContent(customPrompt, chatId);  // Pass chatId
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

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
  // Add retry logic if needed
  if (error.code === 'ETELEGRAM') {
    console.log('Restarting polling...');
    bot.stopPolling();
    setTimeout(() => {
      bot.startPolling();
    }, 5000);
  }
});

app.get('/', (req, res) => {
  res.send('Telegram bot is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});