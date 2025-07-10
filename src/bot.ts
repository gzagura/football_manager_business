import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing in .env file');
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'there';
  bot.sendMessage(chatId, `Hello ${name}! I can send you invoices soon 🧾`);
});

bot.onText(/\/send_invoice/, (msg) => {
  const chatId = msg.chat.id;

  const options: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💵 Cash Payment', callback_data: 'paid_cash' }],
        [{ text: '💳 Online Payment', url: 'https://example.com/pay' }]
      ]
    }
  };

  bot.sendMessage(chatId, 'Please choose your payment method:', options);
});

bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message?.chat.id;

  if (!chatId || !data) return;

  if (data === 'paid_cash') {
    bot.sendMessage(chatId, '✅ Marked as paid by cash. Thank you!');
    // Save to DB later
  }
});

bot.on('poll_answer', (answer) => {
  const user = answer.user;
  const optionIds = answer.option_ids;

  console.log(`[Poll Answer] ${user.first_name} voted option ${optionIds}`);

  // Example: option 0 = Yes
  if (optionIds.includes(0)) {
    bot.sendMessage(user.id, '✅ Thanks for voting YES! You’ll get an invoice soon.');
    // Store to DB or file
  } else {
    bot.sendMessage(user.id, '👍 Thanks for your vote!');
  }
});

bot.onText(/\/create_poll/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendPoll(chatId, 'Will you participate in the event?', ['Yes', 'No'], {
    is_anonymous: false
  });
});