import * as Discord from "discord.js";
import CommandClient from "../classes/CommandClient";

module.exports = {
    name: 'join',
    aliases: ['j'],
    description: "Join a game of Wolf",
    args: false,
    execute(message: Discord.Message, args: string[]){

        if(!args.length || args[0] !== 'gm'){
            (message.client as CommandClient).lobby.join(message.author);
            message.react('🐺')
        }
        else{
            (message.client as CommandClient).lobby.joinGM(message.author);
            message.react('🎲');
        }
    }
}