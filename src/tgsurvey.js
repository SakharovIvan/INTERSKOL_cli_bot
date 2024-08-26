const keyboard = () => {
  return {
    inline_keyboard: [
      [
        { text: "0", callback_data: 0 },
        { text: "1", callback_data: 1 },
        { text: "2", callback_data: 2 },
      ],
      [
        { text: "3", callback_data: 3 },
        { text: "4", callback_data: 4 },
        { text: "5", callback_data: 5 },
      ],
      [
        { text: "6", callback_data: 6 },
        { text: "7", callback_data: 7 },
        { text: "8", callback_data: 8 },
      ],
      [
        { text: "9", callback_data: 9 },
        { text: "10", callback_data: 10 },
        { text: "Завершить", callback_data: `exit` },
      ],
    ],
    //resize_keyboard: true,
    //remove_keyboard: true
  };
};

const opros = {
  1: `Оцените общий уровень удовлетворенностью\n0 - не удовлетворен\n10 - полностью удовлетворен`,
  2: `На сколько Вы остались удовлетворены скоростью выполнения ремонта\n0 - не удовлетворен\n10 - полностью удовлетворен`,
  3: `Оцените качество общения с сотрудниками сервисного центра\n0 - Очень плохо\n10 - Отлично`,
  0: `Спасибо за ответы `,
};
class UserModel {
  constructor(chatId) {
    this.chatId = chatId;
    this.answers = { 1: "", 2: "", 3: "" };
  }
  createAnswer = (question, answer) => {
    this.answers[question] = answer;
  };
}

export { opros, keyboard, UserModel };
