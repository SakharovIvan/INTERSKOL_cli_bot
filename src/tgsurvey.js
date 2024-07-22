const keyboard = (questionnumber)=> {
    return {
    inline_keyboard: [
        [{text:'0',callback_data:`${questionnumber}`}, {text:'1',callback_data:`${questionnumber}`},{text:'2',callback_data:`${questionnumber}`}],
        [{text:'4',callback_data:`${questionnumber}`}, {text:'4',callback_data:`${questionnumber}`},{text:'5',callback_data:`${questionnumber}`}],
        [{text:'7',callback_data:`${questionnumber}`}, {text:'7',callback_data:`${questionnumber}`},{text:'8',callback_data:`${questionnumber}`}],
        [{text:'9',callback_data:`${questionnumber}`}, {text:'10',callback_data:`${questionnumber}`},{text:'Завершить',callback_data:`2`}],

    ],
    //resize_keyboard: true,
    //remove_keyboard: true
}
}

const opros ={
    1: `Оцените общий уровень удовлетворенностью\n0 - не удовлетворен\n10 - полностью удовлетворен`,
    2: `На сколько Вы остались удовлетворены скоростью выполнения ремонта\n0 - не удовлетворен\n10 - полностью удовлетворен`,
    3: `Оцените качество общения с сотрудниками сервисного центра\n0 - Очень плохо\n10 - Отлично`,
    0: `Спасибо за ответы `

}


export  {opros,keyboard}
