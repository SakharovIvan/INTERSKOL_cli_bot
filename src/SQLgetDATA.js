import { GIS_SERVICE_URL } from "../config.js";
const normalizeTlf = (tlf) => {
  const newtlf = tlf
    .replace(/ /g, "")
    .replace(/\+/g, "")
    .replace(/\(/g, "")
    .replace(/-/g, "")
    .replace(/\)/g, "");
  return `+7 (${newtlf[1]}${newtlf[2]}${newtlf[3]}) ${newtlf[4]}${newtlf[5]}${newtlf[6]} ${newtlf[7]}${newtlf[8]} ${newtlf[9]}${newtlf[10]}`;
};

const normalizeSno = (sno) => {
  console.log(sno);
  if (sno.length === 11) {
    return sno;
  }
  return sno.length === 10 ? `0${sno}` : `00${sno}`;
};
export class SearchForRepairInfo {
  constructor(data = { snno_tool, cli_tlf, gis_code, asc_ndk }) {
    this.data = data;
  }
  async init() {
    switch (this.data) {
      case snno_tool:
        const param_snno_tool = new URLSearchParams({ snno_tool });
        this.repairList = await fetch(
          `${GIS_SERVICE_URL}?${param_snno_tool.toString()}`,
          {
            method: "GET",
          }
        );
        break;
      case cli_tlf:
        const param_cli_tlf = new URLSearchParams({ cli_telephone: cli_tlf });
        this.repairList = await fetch(
          `${GIS_SERVICE_URL}?${param_cli_tlf.toString()}`,
          {
            method: "GET",
          }
        );
        break;
    }
    await this.createMessage();
  }

  async createMessage() {
    if ((this.repairList = 0)) {
    }
    if ((this.repairList = 1)) {
      let dia =
        result?.dia === null
          ? `\nИнструемнт еще не продиагностирован`
          : `\nДата проведения диагностики: ${result.dia}`;
      let vip =
        result?.vipoln === null
          ? `\nИнструемнт еще в ремонте`
          : `\nДата выполнения ремонта: ${result.vipoln}`;

      this.msg = {};
      this.msg.text = `🔫 Ваш инструмент: \nСерийный номер ${result?.snno_tool}\nКод машины ${result?.matno_tool} \nСервисный центр ${result?.asc_name} \nВид ремонта ${result?.vr}\n
⚒️ Статус ремонта: \nДата принято: ${result?.prin}${dia}${vip}\n
🧰 Для связи с АСЦ: \nТелефон АСЦ ${result?.asc_telephone} \nАдрес АСЦ ${result?.asc_adr}`;
    }

    if (this.repairList > 1) {
      let listObj = [];
      for (let el of this.repairList) {
        listObj.push([
          {
            text: `${el.snno_tool} | ${el.matno_tool}`,
            callback_data: `${el.asc_ndk};${el.asc_kod}`,
          },
        ]);
      }
    }
  }

  async getASCInfo(){
    
  }

  async getToolInfo(tool_id = this.repairList[0].tool_id) {
    const param = new URLSearchParams({ tool_id });
    const result = await fetch(`${GIS_SERVICE_URL}/tool?${param.toString()}`, {
      method: "GET",
    });
    const search = await result.json();
    this.tool = search;
  }
}

const getFulldataByTool_id = async (tool_id) => {
  const param = new URLSearchParams({ tool_id });
  const result = await fetch(`${GIS_SERVICE_URL}/tool?${param.toString()}`, {
    method: "GET",
  });
  console.log(tool_id, result);
  if (result.status === 404) {
    return new Error();
  }
  const search = await result.json();
  console.log(search);
  return search;
};

const getFulldataBySno = async (sno) => {
  const param = new URLSearchParams({ snno_tool: sno });
  const result = await fetch(`${GIS_SERVICE_URL}?${param.toString()}`, {
    method: "GET",
  });
  if (result.status === 404) {
    return new Error();
  }
  const search = await result.json();
  return search;
};

const getFullDataBySnoTlf = async (gis_code, asc_ndk) => {
  const param = new URLSearchParams({ gis_code, asc_ndk });
  const result = await fetch(`${GIS_SERVICE_URL}?${param.toString()}`, {
    method: "GET",
  });
  if (result.status === 404) {
    return new Error();
  }
  const search = await result.json();
  return search;
};

export { getFulldataByTool_id, getFulldataBySno, getFullDataBySnoTlf };
