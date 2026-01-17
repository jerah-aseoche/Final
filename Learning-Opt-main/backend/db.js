import mysql from "mysql2";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "10252009",
  database: "vibralert"
}).promise();
