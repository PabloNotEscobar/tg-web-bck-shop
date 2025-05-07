const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');  // ОБЯЗАТЕЛЬНО — если у тебя node 16 и ниже
const TelegramBot = require('node-telegram-bot-api');

const token = '7842171869:AAFrYNCR3F7lznkJpyIY9eJwyHwVByR3zpI';
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = 'https://animated-narwhal-4619ab.netlify.app';
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
                ]
            }
        });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);

            await bot.sendMessage(chatId, "Спасибо за обратную связь!");
            await bot.sendMessage(chatId, "Ваша страна: " + data?.country);

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Ваша улица: " + data?.street);
            }, 3000);
        } catch (e) {
            console.error('Ошибка обработки данных формы', e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, totalPrice, products } = req.body;
    console.log('Получены данные с фронта:', req.body);

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Успешная покупка",
            input_message_content: {
                message_text: `Поздравляем с успешной покупкой на сумму ${totalPrice}₽!\n\nТовары: ${products.map(p => p.title).join(', ')}`
            }
        });

        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error('Ошибка отправки WebAppQuery', e);

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {
                message_text: "Не удалось приобрести товар."
            }
        });

        return res.status(500).json({ error: 'Failed to send answerWebAppQuery' });
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
