import * as Discord from 'discord.js'
import { generateSlug } from 'random-word-slugs'
import Lobby from './Lobby'
import { WordSelector, WordPair } from './WordSelector'

/* TODO:
 * 6 players MAX for alternative gamemode where everyone gets a unique word.
 * EVERYONE option for alternative game mode where @ end of game
 */

function msgFilterWordSelectionOnly(msg: Discord.Message): boolean {
	return WordSelector.Validate(msg.content)
}

function msgFilterWordSubmission(msg: Discord.Message): boolean {
	return (
		msg.content.trim().toLowerCase() === '-r' || msgFilterWordSelectionOnly(msg)
	)
}

function msgFilterYN(msg: Discord.Message): boolean {
	return msg.content === 'Y' || msg.content === 'N'
}

function msgFilterEnd(msg: Discord.Message): boolean {
	return msg.content === 'end'
}

export default class Game {
	public gameMaster: Discord.User

	public players: Discord.User[]

	public allPlayers: Discord.User[]

	public words!: WordPair

	public minority: Discord.User | undefined

	private lobby: Lobby

	constructor(lobby: Lobby) {
		this.gameMaster = lobby.DecideGameMaster()
		this.players = lobby.gameMasterQueue.concat(lobby.playerQueue)
		this.allPlayers = this.players
		this.lobby = lobby

		this.Run()
	}

	/**
	 * Initialize majority/minority words for the current game
	 * @returns {Promise<void>} upon completion of the initialization of the majority/minority words
	 */
	private async InitializeWords(): Promise<void> {
		/*
		 * Request words from the GM or generate them from the bot
		 */
		if (this.gameMaster !== this.lobby.client.user) {
			await this.gameMaster
				.createDM()
				.then(async (dmc) => {
					await dmc.send(
						"You're the GM! Please give me 2 words formatted as: 'Majority Word | Minority Word', or send '-r' to select your word pairs randomly from the database!"
					)

					return dmc.awaitMessages({ max: 1, filter: msgFilterWordSubmission })
				})
				.then(async (msg) => {
					if (msg.at(0)?.content.trim().toLowerCase() === '-r') {
						let words = await this.lobby.client.database?.GetUserWordPair(
							this.gameMaster.id
						)

						if (typeof words !== 'undefined') {
							this.words = words
							return
						}
						msg
							.at(0)
							?.reply(
								"You have no submitted words! Please give me 2 words formatted as: 'Majority Word | Minority Word'."
							)

						let resubmission = await msg.at(0)?.channel.awaitMessages({
							max: 1,
							filter: msgFilterWordSelectionOnly,
						})

						this.words = WordSelector.ExtractWords(
							resubmission?.at(0)?.content!
						)!
					} else {
						this.words = WordSelector.ExtractWords(msg.at(0)?.content!)!
					}

					return
				})
		} else {
			const playerUserIds = this.players.map<string>((user) => user.id)

			await this.lobby.client.database
				?.QueryForWordPair(playerUserIds)
				.then((words) => {
					this.words = words ?? WordSelector.RandomWords()
				})!
		}
	}

	private async Run() {
		let decidedGM: Promise<boolean> = new Promise((res, rej) => res(true))

		let timeout: NodeJS.Timeout

		let playersList = ''

		let i = 1
		this.players.forEach((element) => {
			playersList += `${i++}: ` + element.tag + ', '
		})

		let playerDMs = this.players.map(
			async (usr: Discord.User): Promise<void> => {
				const completeUser = await usr.fetch()

				;(await completeUser.createDM())
					.send(`You're a player! The GM is ${this.gameMaster.tag}.
                Awaiting their selection of words...
                Players: ${playersList}`)

				return
			}
		)

		this.allPlayers = this.players

		await this.InitializeWords()
		if (this.gameMaster !== this.lobby.client.user) {
			const dmc = await this.gameMaster.createDM()
			dmc.send('Select Minority? (Y/N)')
			const choice = await dmc.awaitMessages({ max: 1, filter: msgFilterYN })

			if (choice.at(0)!.content === 'Y') {
				dmc.send(playersList)
				const msgFilterNum = (msg: Discord.Message) => {
					if (
						!isNaN(parseInt(msg.content)) &&
						parseInt(msg.content) >= 1 &&
						parseInt(msg.content) <= this.players.length
					) {
						return true
					}

					return false
				}
				const selectionMessage = (
					await dmc.awaitMessages({ max: 1, filter: msgFilterNum })
				).at(0)?.content!
				this.minority = this.players[parseInt(selectionMessage)]
				this.players = this.players.filter((u) => u !== this.minority)
			}
		} else {
			this.minority =
				this.players[Math.floor(Math.random() * this.players.length)]
			this.players = this.players.filter((u) => u !== this.minority)
		}

		this.players.forEach(async (majorityPlayer) => {
			;(await majorityPlayer.createDM()).send(
				`Your word is ${this.words.majorityWord}.`
			)
		})
		;(await this.minority!.createDM()).send(
			`Your word is ${this.words.minorityWord}.`
		)

		timeout = setTimeout(() => {
			this.EndGame()
		}, 10 * 60 * 1000)

		if (this.gameMaster !== this.lobby.client.user) {
			const dmc = await this.gameMaster.createDM()
			dmc.send(
				`The minority player is ${this.minority?.tag} with ${this.words.minorityWord}. Starting 10 minute clock... (Stop the clock and end the game by typing 'end')`
			)
			const message = await dmc.awaitMessages({ max: 1, filter: msgFilterEnd })
			if (message) {
				clearTimeout(timeout)
				this.EndGame()
			}
		}
	}

	EndGame() {
		if (this.gameMaster !== this.gameMaster.client.user) {
			this.gameMaster.createDM().then((dmc) => {
				dmc.send('Game Time is up! Notify the players.')
			})
		}

		let votes = new Map<Discord.User, number>()

		let playersList = ''

		let i = 1
		this.allPlayers.forEach((player) => {
			playersList += `${i++}: ` + player.tag + ', '
			votes.set(player, 0)
		})

		let voteCount = 0

		this.allPlayers.forEach((player) => {
			player
				.createDM()
				.then((dmc) => {
					dmc.send(`Vote your selection for the minority:
                ${playersList}`)

					const msgfilternum = (msg: Discord.Message) => {
						return (
							!isNaN(parseInt(msg.content)) &&
							parseInt(msg.content) >= 1 &&
							parseInt(msg.content) < i
						)
					}

					return dmc
						.awaitMessages({ max: 1, filter: msgfilternum })
						.then((msg): Promise<boolean> => {
							let votedPlayer =
								this.allPlayers[parseInt(msg.at(0)!.content) - 1]
							votes.set(votedPlayer, votes.get(votedPlayer)! + 1)
							++voteCount
							return new Promise((res, rej) => {
								res(voteCount === votes.size)
							})
						})
				})
				.then((end: boolean) => {
					if (end) {
						let votedMsg = ''

						votes.forEach((voted, plyr) => {
							votedMsg += `${plyr.tag}: ${voted} vote(s).\n`
						})

						if (this.gameMaster !== this.gameMaster.client.user) {
							this.gameMaster.createDM().then((dmc) => {
								dmc.send(votedMsg)
							})
						} else {
							this.allPlayers.forEach((player) => {
								player.createDM().then((dmc) => {
									dmc.send(votedMsg)
								})
							})
						}
					}
				})
		})
	}
}
