import { pool } from "../config.js";

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

const getFulldataByTlf = async (tlf) => {
  const result = await pool.query(
    `SELECT * FROM gis WHERE cli_telephone = '${normalizeTlf(
      tlf
    )}' ORDER BY id DESC;`
  );
  return result;
};

const getFulldataBySno = async (sno) => {
  const result = await pool.query(
    `SELECT * FROM gis WHERE snNo_tool='${normalizeSno(sno)}' ORDER BY id DESC;`
  );
  return result;
};

const getFullDataBySnoTlf = async (sno, tlf) => {
  const result = await pool.query(
    `SELECT * FROM gis WHERE asc_ndk=${sno} and asc_kod = ${tlf};`
  );
  console.log(`SELECT * FROM gis WHERE asc_ndk=${sno} and asc_kod = ${tlf};`);
  return result;
};

export { getFulldataByTlf, getFulldataBySno, getFullDataBySnoTlf };
