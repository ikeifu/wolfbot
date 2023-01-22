import { Client, ClientOptions } from "discord.js";
import { DBManager } from "./database/DBManager";
import Game from "./Game";
import Lobby from "./Lobby";

export default class CommandClient extends Client {
    public commands: Map<string, any>;
    public lobby : Lobby;
    public game : Game | undefined;
    public database : DBManager | undefined;

    constructor(options: ClientOptions){
        super(options);
        this.commands = new Map<string, any>();
        this.lobby = new Lobby(this);
        this.game = undefined;
    }
}