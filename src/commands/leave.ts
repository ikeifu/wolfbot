import * as Discord from "discord.js";
import CommandClient from "../classes/CommandClient";

module.exports = {
    name: 'leave',
    aliases: ['l'],
    description: "Leave a Wolf Lobby.",
    args: false,
    execute(message: Discord.Message, args: string[]){
        (message.client as CommandClient).lobby.leave(message.author);
    }
}