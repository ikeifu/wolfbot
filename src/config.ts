import mysql from "mysql";

require('dotenv').config()

export const localDBConfig: mysql.ConnectionConfig = {
	host: process.env.LOCAL_DATABASE_HOST,
	user: process.env.LOCAL_DATABASE_USER,
	password: process.env.LOCAL_DATABASE_PASSWORD,
	database: process.env.LOCAL_DATABASE_NAME
}

export const prefix = "!"
export const botToken = process.env.BOT_TOKEN;