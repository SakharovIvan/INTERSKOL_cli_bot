import axios, { isCancel, AxiosError } from "axios";
import { parseFromString } from "dom-parser";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const urlASC = "https://www.interskol.ru/centres";

const gethtml = async (urla) => {
  const result = axios({
    method: "get",
    url: urla,
  }).then(function (response) {
    return response;
  });
  return result;
};

class ASC {
  constructor([
    code,
    subject,
    gorod,
    nameASC,
    adresASC,
    tlfASC
  ]) {
    this.code = code;
    this.subject = subject;
    this.gorod = gorod;
    this.nameASC = nameASC;
    this.adresASC = adresASC;
    this.tlfASC = tlfASC;
  }

}

const creategeocode = (adres) => {
  return `https://geocode-maps.yandex.ru/1.x/?apikey=ce9b9215-2c52-4c70-9e21-b46b23f9c9d2&geocode=${adres.replace(
    / /g,
    '+'
  )}&format=json`;
};

const getgeocode=(gorod)=> {
  return gethtml(creategeocode(gorod))
  .then((res) => {
      const position = res.data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
return position.split(" ");
  }
  )

}

const getASCList = async (url) => {
  const html = await gethtml(url);

  const dom = new JSDOM(await html.data);
  const listCount = await dom.window.document.querySelector(
    "body > div.wrapper > div.content-wrapper > div > div.content-wrapper__body.content > div > div.partners-shops__table > table > tbody"
  ).childElementCount;
  const ascArray = [];
  for (let i = 1; i <= listCount; i++) {
    let siteascinfo = [];
    for (let j = 1; j <= 6; j++) {
      let cellInfo = await dom.window.document.querySelector(
        `body > div.wrapper > div.content-wrapper > div > div.content-wrapper__body.content > div > div.partners-shops__table > table > tbody > tr:nth-child(${i}) > td:nth-child(${j})`
      ).textContent;
      siteascinfo.push(cellInfo);
    }
    let arrayofsiteasc = new ASC(siteascinfo)
  ascArray.push(arrayofsiteasc)
  }
  return ascArray;
};



try {
 const adreslist = await getASCList(urlASC)
 const adreslistgeo = adreslist.map((asc)=>{
  setInterval(()=>{
    getgeocode(asc.adresASC)
    .then((res)=>{
      asc.longitude = res[0]
      asc.latitude= res[1]
    })
    .then(()=>console.log(asc))
  },50)

 })

 Promise.all(adreslistgeo)
 .then((res)=>{
  console.log(res)
 })

} catch (error) {
  console.log(error);
}
export default getASCList;
