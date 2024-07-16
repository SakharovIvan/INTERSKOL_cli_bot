import { pool } from "../config.js";

const normalizeTlf = (tlf) => {
  const newtlf = tlf
    .replace(/ /g, "")
    .replace(/\+/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");
  //console.log(`+7 (${newtlf[1]}${newtlf[2]}${newtlf[3]}) ${newtlf[4]}${newtlf[5]}${newtlf[6]} ${newtlf[7]}${newtlf[8]} ${newtlf[9]}${newtlf[10]}`)
  return `+7 (${newtlf[1]}${newtlf[2]}${newtlf[3]}) ${newtlf[4]}${newtlf[5]}${newtlf[6]} ${newtlf[7]}${newtlf[8]} ${newtlf[9]}${newtlf[10]}`;
};
const normalizeSno = (sno)=>{
  console.log(sno)
 return sno.length===10?`0${sno}`:`00${sno}`
}

const getFulldataByTlf = async (tlf) => {
  console.log(normalizeSno(tlf))
  const result = await pool.query(
    `SELECT * FROM gis WHERE cli_telephone = '${normalizeTlf(tlf)}' OR snNo_tool='${normalizeSno(tlf)}' ORDER BY id DESC;`
  );
  return result;
};
//+7 (961) 120 73 22





export default getFulldataByTlf;
