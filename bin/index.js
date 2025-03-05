import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import {
  getFulldataByTlf,
  getFulldataBySno,
  getFullDataBySnoTlf,
} from "../src/SQLgetDATA.js";
import log from "simple-node-logger";
import sqlLog from "../src/botlogSQL.js";
const bot = new TelegramAPI(token, { polling: true });
const textStart = `Добро пожаловать в телеграм бот ИНТЕРСКОЛ.\nЗдесь Вы можете проверить статус гарантийного ремонта по номеру телефона\nДля того, чтобы найти свой инструмент, введите номер телефона в следующем формате _7 999 999 99 99_`;
const textMap = `В разработке, можете проверить ближайший асц по ссылке https://www.interskol.ru/centres \nИли отправить инструмент через Service online`;
const textError_findTool = `Не удалось найти информаицю по Вашему телефону((\nДавайте попробуем поиск по серийному номеру в следующем формате _123.123456_`;
const textError_findSno = `Мы не нашли Вашего инструмента🥺, но не расстраивайтесь, попробуйте связаться с сервисным центром. Для поиска телефона сервисного центра введите команду /map`;
const defaultError = `Проверьте корреткность формата 😰`;
const survey = `Оцените качество обслуживания сервиса ИНТЕРСКОЛ clck.ru/36DVgn 📈 `;

const tlfFormat = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,15}$/;
const sNoFormat = /\d{2,3}\.\d{6}/;
const msgoption = {
  parse_mode: "Markdown",
  reply_markup: {
    resize_keyboard: true,
  },
};

const logger = log.createSimpleLogger({
  logFilePath: "logger.log",
  timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
});
logger.setLevel("info" || "debug");

const sentRepairInfo = async (chatID, result) => {
  console.log(result)
  let dia =
    (result?.date_dia) === undefined
      ? `\nИнструемнт еще не продиагностирован`
      : `\nДата проведения диагностики: ${result.date_dia}`;
  let vip =
    (result?.date_prin) === undefined
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
    { command: "/survey", description: "Пройти опрос удовлетворенности" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatID = msg.chat.id;
    const username = msg.from.username;
    const time = msg.date;
    await sqlLog(chatID, username, text, time);
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
        case text === "/survey":
          await bot.sendMessage(chatID, survey, msgoption);
          break;

        case tlfFormat.test(text):
          const fulldata = await getFulldataByTlf(text);
          switch (true) {
            case fulldata.rows.length === 0:
              await bot.sendMessage(chatID, textError_findTool, msgoption);
              break;
            case fulldata.rows.length === 1:
              const result = await fulldata.rows[0];
              await sentRepairInfo(chatID, result);
              break;
            case fulldata.rows.length > 1:
              const list = fulldata.rows;
              let listObj = [];

              for (let el of list) {
                listObj.push([
                  {
                    text: `${el.snno_tool} | ${el.matno_tool}`,
                    callback_data: `${el.asc_ndk};${el.asc_kod}`,
                  },
                ]);
              }
              await sentRepairInfo(chatID, list[0]);
              console.log(listObj);
              await bot.sendMessage(chatID, "Другие ремонты", {
                reply_markup: {
                  inline_keyboard: listObj,
                },
              });
              break;
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
          await bot.sendMessage(chatID, defaultError, msgoption);
          break;
      }
    } catch (err) {
      logger.info(err);
      console.log(err);
    }
  });
  bot.on("callback_query", async (msg) => {
    // console.log(msg)
    const chatID = msg.message.chat.id;
    const result = await getFullDataBySnoTlf(
      msg.data.split(";")[0],
      msg.data.split(";")[1]
    );
    //console.log(result.rows,msg.data.split(";")[0], msg.data.split(";")[1])
    await sentRepairInfo(chatID, result.rows[0]);
    return;
  });

  return;
};

start();
