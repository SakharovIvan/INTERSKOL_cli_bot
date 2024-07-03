import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "root",
  host: "127.0.0.1",
  database: "fortest",
  password: "root",
  port: "5432",
});

export { emailConfig, pool };
