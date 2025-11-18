import { GIS_SERVICE_URL } from "../config.js";
import { textError_findSno, textError_findTool } from "./messages.js";
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
  if (sno.length === 11) {
    return sno;
  }
  return sno.length === 10 ? `0${sno}` : `00${sno}`;
};
export class SearchForRepairInfo {
  constructor(data = { snno_tool, cli_tlf, gis_code, asc_ndk }) {
    this.data = data;
    this.msg = { text: "", length: 0 };
  }
  async init() {
    if (this.data.snno_tool) {
      const param = new URLSearchParams({
        snno_tool: normalizeSno(this.data.snno_tool),
      });
      const res = await fetch(`${GIS_SERVICE_URL}?${param.toString()}`, {
        method: "GET",
      });
      this.repairList = await res.json();
      return;
    }
    if (this.data.cli_tlf) {
      const param = new URLSearchParams({
        cli_telephone: this.data.cli_tlf.replace(/\s+/g, ""),
      });
      const result = await fetch(`${GIS_SERVICE_URL}?${param.toString()}`, {
        method: "GET",
      });
      this.repairList = await result.json();
      return;
    }
    if (this.data.gis_code && this.data.asc_ndk) {
      const param = new URLSearchParams({ gis_code:this.data.gis_code, asc_ndk:this.data.asc_ndk });
      const result = await fetch(`${GIS_SERVICE_URL}?${param.toString()}`, {
        method: "GET",
      });
      this.repairList = await result.json();
      return ;
    }
  }

  async createMessage() {
    if (this.repairList.length === 0 || this.repairList[0] === undefined) {
      if (this.data.cli_tlf) {
        this.msg.text = textError_findTool;
      }
      if (this.data.snno_tool) {
        this.msg.text = textError_findSno;
      }
      this.msg.length = 0;

      return;
    }
    if (this.repairList.length === 1) {
      await this.getToolInfo();
      await this.getASCInfo();
      const result = { ...this.repairList[0], ...this.tool, ...this.asc };
      let dia =
        result.dia === null
          ? `\nИнструемнт еще не продиагностирован`
          : `\nДата проведения диагностики: ${result.dia}`;
      let vip =
        result.vipoln === null
          ? `\nИнструемнт еще в ремонте`
          : `\nДата выполнения ремонта: ${result.vipoln}`;
      let status = result.vipoln
        ? " Ремонт выполнен ✅"
        : "Инструмент находится в сервисе ❌";
      this.msg = {};
      this.msg.length = 1;
      this.msg.text = `🔫 Ваш инструмент: \nСерийный номер ${result?.snno_tool}\nКод машины ${result?.matno_tool} \nСервисный центр ${result?.organization_name} \nВид ремонта: ${result?.vr}\n
⚒️ Статус ремонта:${status} 
\nДата принято: ${result?.prin}${dia}${vip}\n`;
      //🧰 Для связи с АСЦ: \nТелефон АСЦ ${result?.asc_telephone} \nАдрес АСЦ ${result?.asc_adr}
      return;
    }

    if (this.repairList.length > 1) {
      let listObj = [];
      const asc_promise = this.repairList.map(async (el)=>{
        const tool =await this.getToolInfo(el.tool_id)
        const asc = await this.getASCInfo(el.asc_id) 
        return {...el,...asc,...tool}
      })
     const repair_list_with_asc = await Promise.all(asc_promise)
      for (let el of repair_list_with_asc) {
        listObj.push([
          {
            text: `${el.snno_tool} | ${el.matno_tool}`,
            callback_data: `${el.ndk};${el.gis_code}`,
          },
        ]);
      }
      this.msg.length = 2;
      this.msg.options=listObj
    }
  }

  async getASCInfo(asc_id = this.repairList[0].asc_id) {
    const param = new URLSearchParams({ asc_id });
    const result = await fetch(`${GIS_SERVICE_URL}/asc?${param.toString()}`, {
      method: "GET",
    });
    const search = await result.json();
    this.asc = search;
    return search
  }

  async getToolInfo(tool_id = this.repairList[0].tool_id) {
    const param = new URLSearchParams({ tool_id });
    const result = await fetch(`${GIS_SERVICE_URL}/tool?${param.toString()}`, {
      method: "GET",
    });
    const search = await result.json();
    this.tool = search;
    return search
  }
}

