import { pool } from "../config.js";

export default async(chatID, clie, text, time)=>{
    try{
        await pool.query(`INSERT INTO clientlog (chatid, cli, text,time) VALUES (${chatID},'${clie}','${text}',${Number(time)} );`)
        console.log('Cli Log added')
    }catch(err){console.log(err)}
    }