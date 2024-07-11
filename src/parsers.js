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
    setgeocode(adresASC) {
      gethtml(creategeocode(adresASC))
      .then((res) => {
          let position = res.metaDataProperty.GeocoderResponseMetaData.Point.pos;
          position.split(" ");
      this.longtitude = longtitude;
      this.latitude = latitude;
      }
      )

  }
}

const creategeocode = (adres) => {
  return `https://geocode-maps.yandex.ru/1.x/?apikey=ce9b9215-2c52-4c70-9e21-b46b23f9c9d2&geocode=${adres.replace(
    / /g,
    '+'
  )}&format=json`;
};

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
  //  setInterval(() => {
  //    gethtml(creategeocode(siteascinfo[4]));
  //  }, 100)
  //    .then((res) => {
  //      let position = res.metaDataProperty.GeocoderResponseMetaData.Point.pos;
  //      position.split(" ");
  //      siteascinfo.push(position[0], position[1]);
  //    })
  //    .then(() => ascArray.push(new ASC(siteascinfo)));
  ascArray.push(arrayofsiteasc)
  }
  return ascArray;
};

try {
  getASCList(urlASC)
    .then((json) => {
      console.log(json[4].adresASC)
      gethtml(creategeocode(json[4].adresASC))
      .then((res)=>{console.log(res.data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos)})
    })
    .then((res) => {
console.log(res)
    });
} catch (error) {
  console.log(error);
}
export default getASCList;
