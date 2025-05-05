require('dotenv').config();
const express = require('express')
const cors = require('cors')

const telegramBot = require('node-telegram-bot-api');
const token = '7842171869:AAFrYNCR3F7lznkJpyIY9eJwyHwVByR3zpI';
const bot = new telegramBot(token, {polling: true});
const webAppUrl = process.env.WEB_APP_URL;

app.use(express.json)
app.use(cors)


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const inline_keyboard = {
        reply_markup: {
            keyboard: [
                [{text: 'Открыть приложение', web_app: {url: webAppUrl + '/form'}}]
            ]
        }
    };

    if (msg.text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, "Спасибо за обратную связь!")
            await bot.sendMessage(chatId, "Ваша страна " + data?.country)

            setTimeout(async () => { //чтобы тг не банил за спам
                await bot.sendMessage(chatId, "Ваша улица " + data?.street)
            }, 3000)
        } catch (e) {

        }
    }
});


app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Успешная покупка",
            input_message_content: {message_text: "поздравляем с успешной покупкой на сумму " + totalPrice}
        })
        return res.status(200).json({})
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {message_text: "Не удалось приобрести товар" + totalPrice}
        })
        return res.status(500).json({})
    }

})

const PORT = 8000
app.listen(PORT, () => {console.log(`Server started at PORT ${PORT}`)})