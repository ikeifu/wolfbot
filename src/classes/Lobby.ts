import * as Discord from "discord.js";
import CommandClient from "./CommandClient";

export default class Lobby {


    public gameMasterQueue : Discord.User[];

    public playerQueue : Discord.User[];
    client: CommandClient;

    constructor(client : CommandClient){
        this.gameMasterQueue = new Array(0);
        this.playerQueue = new Array(0);
        this.client = client;
    }

    join(user: Discord.User){
        if(this.playerQueue.includes(user)) return;

        if(this.gameMasterQueue.includes(user)) this.gameMasterQueue = this.gameMasterQueue.filter( u => u !== user);

        this.playerQueue.push(user);
    }

    joinGM(user: Discord.User){
        if(this.gameMasterQueue.includes(user)) return;

        if(this.playerQueue.includes(user)) this.playerQueue = this.playerQueue.filter( u => u !== user);

        this.gameMasterQueue.push(user);
    }

    /**
     * Leave the lobby Queue, Game Master or Player.
     * @param user {Discord.User} to remove from the Queues.  
     */
    leave(user: Discord.User) {
        if(this.playerQueue.includes(user)){
            this.playerQueue = this.playerQueue.filter( u => u !== user);
        }

        if(this.gameMasterQueue.includes(user)){
            this.gameMasterQueue = this.gameMasterQueue.filter( u => u !== user );
        }
    }

    Clear() {
        this.gameMasterQueue = new Array(0);
        this.playerQueue = new Array(0);
    }
    

    /**
     * Decide the Game Master from the GM queue and remove that user from the GameMasterQueue
     * @returns {Discord.User} that has been decided as the game master, or the bot client user if no other users were in the GM Queue.
     */
    DecideGameMaster(): Discord.User {
        if(this.gameMasterQueue.length === 0){
            return this.client.user!;
        }

        let gm = this.gameMasterQueue[Math.floor(Math.random() * this.gameMasterQueue.length)];

        this.gameMasterQueue = this.gameMasterQueue.filter( u => u !== gm );
        
        return gm;
    }
}