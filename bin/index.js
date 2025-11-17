import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import {
  getFulldataByTool_id,
  getFulldataBySno,
  getFullDataBySnoTlf,
} from "../src/SQLgetDATA.js";

import {
  textStart,
  textMap,
  textError_findTool,
  textError_findSno,
  defaultError,
  survey,
} from "../src/messages.js";

const bot = new TelegramAPI(token, { polling: true });

const tlfFormat = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,15}$/;
const sNoFormat = /\d{2,3}\.\d{6}/;
const msgoption = {
  parse_mode: "Markdown",
  reply_markup: {
    resize_keyboard: true,
  },
};

const sentRepairInfo = async (chatID, result) => {
  let dia =
    result?.dia === null
      ? `\nИнструемнт еще не продиагностирован`
      : `\nДата проведения диагностики: ${result.dia}`;
  let vip =
    result?.vipoln === null
      ? `\nИнструемнт еще в ремонте`
      : `\nДата выполнения ремонта: ${result.vipoln}`;

  await bot.sendMessage(
    chatID,
    `🔫 Ваш инструмент: \nСерийный номер ${result?.snno_tool}\nКод машины ${result?.matno_tool} \nСервисный центр ${result?.asc_name} \nВид ремонта ${result?.vr}\n
⚒️ Статус ремонта: \nДата принято: ${result?.prin}${dia}${vip}\n
🧰 Для связи с АСЦ: \nТелефон АСЦ ${result?.asc_telephone} \nАдрес АСЦ ${result?.asc_adr}`,
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
            case fulldata.length === 0:
              await bot.sendMessage(chatID, textError_findTool, msgoption);
              break;
            case fulldata.length === 1:
              const result = await fulldata[0];
              await sentRepairInfo(chatID, result);
              break;
            case fulldata.length > 1:
              const list = fulldata;
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
          if ((fulldataSno.length = 1)) {
            const current_tool = await getFulldataByTlf(fulldataSno[0].tool_id)
            await sentRepairInfo(chatID, {...fulldataSno[0],...current_tool});
            break;
          }
          if (fulldataSno.length > 1) {
            break;
          } else {
            await bot.sendMessage(chatID, textError_findSno, msgoption);
          }
          break;
        default:
          await bot.sendMessage(chatID, defaultError, msgoption);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });

  bot.on("callback_query", async (msg) => {
    const chatID = msg.message.chat.id;
    const result = await getFullDataBySnoTlf(
      msg.data.split(";")[0],
      msg.data.split(";")[1]
    );
    await sentRepairInfo(chatID, result[0]);
    return;
  });

  return;
};

start();
