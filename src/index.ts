import { MessageComponentInteraction } from "discord.js";
import client from "./client";
import * as config from "./config";
import { DBManager } from "./classes/database/DBManager";
main();

async function main() {

    const db = new DBManager();

    Promise.all([client.login(config.botToken), db.init()]).then(() => {
        client.database = db;
        console.log("Logged in!");
    });
}