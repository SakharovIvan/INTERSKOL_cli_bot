import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import getFulldataByTlf from "../src/SQLgetDATA.js";
const bot = new TelegramAPI(token, { polling: true });

const textStart = `Добро пожаловать в телеграм бот по информационной системе ИНТЕРСКОЛ\nДля поиска применимости запчасти введите артикул ЗЧ\nДля поиска схем инструмента введите код инструмента - первые числа до точки в серийном номере инструмента или артикула с коробки инструмента`;
const textMap = `В разработке, можете проверить ближайший асц по ссылке https://www.interskol.ru/centres \nИли отправить инструмент через Service online`;
const msgoption ={ 
  parse_mode: 'Markdown',
  reply_markup: {
      resize_keyboard: true
  }
}
const start = async () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/map", description: "Найти ближайший АСЦ" },
    {
      command: "/findbytelephonenumber",
      description: "Начальное приветствие",
    },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatID = msg.chat.id;
    const username = msg.from.username;
    const time = msg.date;
    try {
      switch (text) {
        case "/start":
          await bot.sendMessage(chatID, textStart,msgoption);
          break;
        case "/map":
          await bot.sendMessage(chatID, textMap,msgoption);
          break;
        case "/findbytelephonenumber":
          await bot.sendMessage(chatID, textStart,msgoption);
          break;
        default:
          const result = await getFulldataByTlf(text);
          await bot.sendMessage(
            chatID,
            `Ваш инструмент\n
      Серийный номер ${result.snno_tool}\n
      Код машины ${result.matno_tool}\n
      Серисный центр ${result.asc_name}\n
      Вид ремонта ${result.vr}\n
      Для связи с АСЦ:\n
      Телефон АСЦ ${result.asc_telephone}\n
      Адрес АСЦ ${result.asc_adr}`,msgoption
          );

          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
};

start();
