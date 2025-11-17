import { token } from "../config.js";
import TelegramAPI from "node-telegram-bot-api";
import {
  getFulldataByTool_id,
  getFulldataBySno,
  getFullDataBySnoTlf,
  SearchForRepairInfo,
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
          const answer_tlf = new SearchForRepairInfo({ cli_tlf: text });
          await answer_tlf.init();
          await answer_tlf.createMessage();
          if (answer_tlf.msg.length === 1 || answer_tlf.msg.length === 0) {
            await bot.sendMessage(chatID, answer_tlf.msg.text);
          }

          break;
        case sNoFormat.test(text):
          const answer = new SearchForRepairInfo({ snno_tool: text });
          await answer.init();
          await answer.createMessage();
          if (answer.msg.length === 1 || answer.msg.length === 0) {
            await bot.sendMessage(chatID, answer.msg.text);
          }
          if(answer.msg.length === 2){
            await bot.sendMessage(chatID,'Выберите один из ремонтов', answer.msg.options)
          }
          break;
        default:
          await bot.sendMessage(chatID, defaultError);
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
    const answer = new SearchForRepairInfo({
      gis_code: result[1],
      asc_ndk: result[0],
    });
    await answer.init();
    await answer.createMessage();
    if (answer.msg.length === 1 || answer.msg.length === 0) {
      await bot.sendMessage(chatID, answer.msg.text);
    }
    return;
  });

  return;
};

start();
