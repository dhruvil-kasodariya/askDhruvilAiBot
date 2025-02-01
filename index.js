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

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  }
});

const userLanguages = new Map();

const languages = [
  'Java', 'JavaScript', 'Python', 'C++', 'Rust', 
  'Solidity', 'TypeScript', 'Go', 'Kotlin', 
  'Swift', 'PHP', 'Ruby', 'Scala', 'Dart', 
  'Haskell', 'Elixir', 'Crystal'
];

function getLanguageMenu() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: languages.reduce((rows, lang, index) => {
        if (index % 3 === 0) rows.push([]);
        rows[rows.length - 1].push({ 
          text: lang, 
          callback_data: `language:${lang}` 
        });
        return rows;
      }, [])
    })
  };
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId, 
    "Welcome to the AI Assistant! Select a language for assistance:", 
    getLanguageMenu()
  );
});

bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('language:')) {
    const selectedLanguage = data.split(':')[1];
    userLanguages.set(chatId, selectedLanguage);
    
    bot.answerCallbackQuery(callbackQuery.id);
    bot.sendMessage(
      chatId, 
      `Language set to ${selectedLanguage}. Ready to help!`
    );
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const customPrompt = msg.text;
  
  if (customPrompt === '/start') return;

  if (customPrompt === '/reset') {
    clearChatHistory(chatId);
    userLanguages.delete(chatId);
    await bot.sendMessage(chatId, "Reset complete!");
    bot.sendMessage(
      chatId, 
      "Let's start over! Select a language:", 
      getLanguageMenu()
    );
    return;
  }

  if (!userLanguages.has(chatId)) {
    await bot.sendMessage(
      chatId, 
      "Please select a language first using /start"
    );
    return;
  }

  try {
    const selectedLanguage = userLanguages.get(chatId);
    bot.sendChatAction(chatId, "typing");
    const generatedContent = await generateAIContent(
      customPrompt, 
      chatId, 
      selectedLanguage
    );
    await bot.sendMessage(chatId, generatedContent,{
      parse_mode: 'Markdown', disable_web_page_preview: true});
  } catch (error) {
    console.error("Error:", error);
    bot.sendMessage(
      chatId,
      "Request failed. Please try again."
    );
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error.code === 'EFATAL') process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
  if (error.code === 'ETELEGRAM') {
    bot.stopPolling();
    setTimeout(() => bot.startPolling(), 5000);
  }
});

app.get('/', (req, res) => res.send('Bot running'));
app.listen(port, () => console.log(`Server on port ${port}`));