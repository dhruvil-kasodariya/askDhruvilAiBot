
const TelegramBot = require('node-telegram-bot-api');
const generateAIContent = require('./servies/generateAIContent.js');
require('dotenv').config();

const token = process.env.TELIGRAM_BOT_API_KEY;

const bot = new TelegramBot(token, {
    polling: true,
    request: {
      rejectUnauthorized: false
    }
  });

// Add this error listener
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const customPrompt = msg.text;

  console.log('Received message:', customPrompt);

  try {
    bot.sendChatAction(chatId, 'typing');

    const generatedContent = await generateAIContent(customPrompt);

    const maxLength = 4000;
    for (let i = 0; i < generatedContent.length; i += maxLength) {
      const chunk = generatedContent.substring(i, i + maxLength);
      await bot.sendMessage(chatId, chunk);
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    bot.sendMessage(chatId, "Sorry, I couldn't process your request. Please try again later.");
  }
});

// Add this to log when the bot starts polling
bot.on('polling_start', () => {
  console.log('Bot started polling');
});

console.log('Bot initialized. Waiting for messages...');



