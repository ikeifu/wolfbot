import * as Discord from "discord.js";
import CommandClient from "../classes/CommandClient";

module.exports = {
    name: 'spectate',
    aliases: ['s'],
    description: "Spectate a Wolf Lobby.",
    args: false,
    execute(message: Discord.Message, args: string[]){
        let game = (message.client as CommandClient).game;
        let gamePlayers = game?.allPlayers;
        if(gamePlayers !== undefined && gamePlayers.find( u => u === message.author) === undefined){
            message.author.createDM().then((dmc) => {
                let playerList = "";

                gamePlayers?.forEach((plyr) => {
                    playerList += plyr.tag + ", ";
                });

                dmc.send(`GM: ${game?.gameMaster}\nPlayers: ${playerList}\nMajority Word: ||${game?.words.majorityWord}||\nMinority Word: ||${game?.words.minorityWord}||\nMinority: ||${game?.minority?.tag}||`)
            });
        }
    }
}