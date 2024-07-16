import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import { getFulldataByTlf, getFulldataBySno } from "../src/SQLgetDATA.js";
const bot = new TelegramAPI(token, { polling: true });

const textStart = `Добро пожаловать в телеграм бот ИНТЕРСКОЛ.\nЗдесь Вы можете проверить статус гарантийного ремонта по номеру телефона\nДля того, чтобы найти свой инструмент, введите номер телефона в следующем формате _7 999 999 99 99_`;
const textMap = `В разработке, можете проверить ближайший асц по ссылке https://www.interskol.ru/centres \nИли отправить инструмент через Service online`;
const textError_findTool = `Не удалось найти информаицю по Вашему телефону((\nДавайте попробуем поиск по серийному номеру в следующем формате 123.123456`;
const textError_findSno = `Мы не нашли Вашего инструмента🥺, но не расстраивайтесь, попробуйте связаться с сервисным центром. Для поиска телефона сервисного центра введите команду /map`;

const tlfFormat = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
const sNoFormat = /\d{2,3}\.\d{6}/;
const msgoption = {
  parse_mode: "Markdown",
  reply_markup: {
    resize_keyboard: true,
  },
};

const sentRepairInfo = async (chatID, result) => {
  let dia =
    (await result.date_dia) === ""
      ? `\nИнструемнт еще не продиагностирован`
      : `\nДата проведения диагнсотики: ${result.date_dia}`;
  let vip =
    (await result.date_prin) === ""
      ? `\nИнструемнт еще в ремонте`
      : `\nДата выполнения ремонта: ${result.date_vipoln}`;
      
  await bot.sendMessage(
    chatID,
    `🔫 Ваш инструмент: \nСерийный номер ${result.snno_tool}\nКод машины ${result.matno_tool} \nСервисный центр ${result.asc_name} \nВид ремонта ${result.vr}\n
⚒️ Статус ремонта: \nДата принято: ${result.date_prin}${dia}${vip}\n
🧰 Для связи с АСЦ: \nТелефон АСЦ ${result.asc_telephone} \nАдрес АСЦ ${result.asc_adr}`,
    msgoption
  );
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
      switch (true) {
        case text === "/start":
          await bot.sendMessage(chatID, textStart, msgoption);
          break;
        case text === "/map":
          await bot.sendMessage(chatID, textMap, msgoption);
          break;
        case text === "/findbytelephonenumber":
          await bot.sendMessage(chatID, textStart, msgoption);
          break;

        case tlfFormat.test(text):
          const fulldata = await getFulldataByTlf(text);
          if (fulldata.rows.length > 0) {
            const result = await fulldata.rows[0];
            await sentRepairInfo(chatID, result);
          } else {
            await bot.sendMessage(chatID, textError_findTool, msgoption);
          }
          break;

        case sNoFormat.test(text):
          const fulldataSno = await getFulldataBySno(text);
          if (fulldataSno.rows.length > 0) {
            const resultSno = await fulldataSno.rows[0];
            await sentRepairInfo(chatID, resultSno);
          } else {
            await bot.sendMessage(chatID, textError_findSno, msgoption);
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
};

start();
