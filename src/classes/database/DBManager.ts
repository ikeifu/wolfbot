import { BaseApplicationCommandData } from "discord.js";
import mysql from "mysql";
import { Sequelize, Model, DataTypes, Options, Op } from "sequelize";
import { INITIALLY_DEFERRED } from "sequelize/types/deferrable";
import { localDBConfig } from "../../config";
import { WordPair } from "../WordSelector";
const sequelize = new Sequelize(localDBConfig.database!, localDBConfig.user!, localDBConfig.password!, {
    host: localDBConfig.host,
    dialect: "mysql"
});


class WordPairing extends Model{
    declare userId: string;
    declare majorityWord: string;
    declare minorityWord: string;
    declare played: boolean;
}

WordPairing.init({
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            is: /^\d{18}$/
        }
    },
    majorityWord: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    minorityWord: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    played: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},
    { 
        sequelize,
        indexes: [ {unique:true, fields: ['majorityWord', 'minorityWord'] } ]
    }
);

export class DBManager {
    constructor(){
        try{
            sequelize.authenticate();
        }
        catch (error){
            console.log(error);
        }
    }

    async init() : Promise<boolean>{
        return new Promise(async (resolve, reject) => {
            await sequelize.sync();
            resolve(true);
        });
    }

    async SubmitWordPair(userId: string, words : WordPair) : Promise<boolean>{
        const insertion = await WordPairing.create( { userId: userId, majorityWord: words.majorityWord, minorityWord: words.minorityWord } )
                                    .catch((error) => {
                                        return undefined;
                                    });
        return !!insertion;
    }

    async GetUserWordPair(userId: string) : Promise<WordPair | undefined> {

        const pairing = await WordPairing.findOne( {
            where: {
                userId: userId,
                played: false
            }
        });

        if(pairing){
            return { majorityWord: pairing.majorityWord, minorityWord: pairing.minorityWord };
        }

        return undefined;
    }

    async QueryForWordPair(ignoreUserIds : string[]) : Promise<WordPair | undefined> {
        const pairing = await WordPairing.findOne( { 
            where: {
                userId: {
                    [Op.notIn]: ignoreUserIds
                },
                played: false
            }
        } );

        if(pairing){
            return { majorityWord: pairing.majorityWord, minorityWord: pairing.minorityWord };
        }

        return undefined;
    }
}