import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import getFulldataByTlf from "../src/SQLgetDATA.js";
const bot = new TelegramAPI(token, { polling: true });

const textStart = `Добро пожаловать в телеграм бот ИНТЕРСКОЛ.\nЗдесь Вы можете проверить статус гарантийного ремонта по номеру телефона\nДля того, чтобы найти свой инструмент, введите свой номер телефона в следующем формате _*7 999 9999 99 99*_`;
const textMap = `В разработке, можете проверить ближайший асц по ссылке https://www.interskol.ru/centres \nИли отправить инструмент через Service online`;
const msgoption = {
  parse_mode: "Markdown",
  reply_markup: {
    resize_keyboard: true,
  },
};
const start = async () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/map", description: "Найти ближайший АСЦ" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatID = msg.chat.id;
    const username = msg.from.username;
    const time = msg.date;
    try {
      switch (text) {
        case "/start":
          await bot.sendMessage(chatID, textStart, msgoption);
          break;
        case "/map":
          await bot.sendMessage(chatID, textMap, msgoption);
          break;
        case "/findbytelephonenumber":
          await bot.sendMessage(chatID, textStart, msgoption);
          break;
        default:
          const result = await getFulldataByTlf(text);
          await bot.sendMessage(
            chatID,
            `Ваш инструмент \nСерийный номер ${result.snno_tool} 
\nКод машины ${result.matno_tool} \nСерисный центр ${result.asc_name} \nВид ремонта ${result.vr}\n
Статус ремонта: \nДата принято: ${result.date_prin}\n Дата проведения диагнсотики: ${result.date_dia}\nДата выполнения ремонта: ${result.date_vipoln}\n
Для связи с АСЦ: \nТелефон АСЦ ${result.asc_telephone} \nАдрес АСЦ ${result.asc_adr}`,
            msgoption
          );

          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
};

start();
