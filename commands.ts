import { Dice } from "./dice";
import { Player } from "./player";
import { Guild, User, Message } from "./node_modules/discord.js/src/"
import { Ante } from "./ante";

const { RichEmbed } = require('discord.js');
const tokenEmoji = '▫'

//Initialize the dice list with emojis and proper dice objects
export function initDice(diceList: any, client) {
	client.emojis.forEach(emoji => {
		if (
			emoji.name.startsWith('d4') ||
			emoji.name.startsWith('d6') ||
			emoji.name.startsWith('d8') ||
			emoji.name.startsWith('d10')
		) {
			const dice: Dice = new Dice(emoji.toString())
			diceList[dice.type].push(dice)
			diceList[dice.type].sort((a, b) => a.value - b.value)
		}
	})
}

//Generate a random string
export function generateRandomString(length: number) {
	const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length;
	let res: string = ''
	for (let i = 0; i < length; i++) {
		res += characters[Math.floor(Math.random() * charactersLength)];
	}
	return res
}

//Find a player in the current fight
export function findPlayer(playerData: User, players: Player[]): Player {
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.playerData.username === playerData.username) {
			return player
		}
	}
}
//Find a player in the server the message was sent in by Id.
export function findPlayerById(userId: string, guild: Guild, players: Player[]): Player {
	for (let i = 0; i < guild.members.length; i++) {
		const member = guild.members[i];
		if (member.id === userId) {
			return findPlayer(member, players)
		}
	}
}
//Find a slayer in the pregens json
export function findSlayer(slayerName: string, pregens) {
	for (let i = 0; i < pregens.slayers.length; i++) {
		const slayer = pregens.slayers[i];
		if (slayer.name.toUpperCase().startsWith(slayerName.toUpperCase())) {
			return slayer;
		}
	}
}
//Find duel participants by duel id
export function findDuelParticipants(duelId: string, players: Player[]): Player[] {
	let participants: Player[] = []
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.duel === duelId) {
			participants.push(player)
		}
	}
	return participants
}

export function printDice(dice: Dice[], pressureTokens?: number): string {
	console.log
	const length = dice.length
	let diceString: string = ''
	for (let i = 0; i < length; i++) {
		const die = dice[i];
		diceString += `${die.emoji} `
	}
	if (pressureTokens) {
		for (let i = 0; i < pressureTokens; i++) {
			diceString += `${tokenEmoji} `
		}
	}
	return diceString
}

export function enter(msg: Message, player: Player, players: Player[], pregens, diceList) {
	let classType: string = msg.content.split(' ')[1].toUpperCase()
	if (!!classType) {
		if (players) {
			if (player) {
				msg.channel.send(`${player.playerData} has already stepped into the fight`)
			} else {
				let slayer = findSlayer(classType, pregens)
				if (slayer) {
					players.push(new Player(slayer.power, msg.author, diceList, slayer.antes, slayer.name))
					msg.channel.send(`${msg.author} has stepped into the fight as The ${slayer.name}`)
				} else { msg.channel.send('Class doesnt exist, yet?') }
			}
		}
	} else {
		msg.channel.send(`No class entered`)
	}
}

export function commit(msg: Message, args: string[], player: Player) {
	let dice = args[1]
	if (dice) {
		const n: number = parseInt(dice.split('d')[0])
		const size: number = parseInt(dice.split('d')[1])
		if (size) {
			if (n) {
				if (size === 4 || size === 6 || size === 8 || size === 10) {
					if (n > 0) {
						if (player) {
							if (player.availablePower - n >= 0) {
								player.push(n, size)
								msg.channel.send(printDice(player.play, player.pressureTokens))
							} else { msg.channel.send(`Cannot over commit, you currently have ${player.availablePower} power left.`) }
						} else { msg.channel.send(`${msg.author} has not stepped into the current fight.`) }
					} else { msg.channel.send('Cannot commit 0 or negative dice.') }
				} else { msg.channel.send('Can only commit d4, d6, d8, d10.') }
			} else { msg.channel.send('No ammount of dice specified.') }
		} else { msg.channel.send('No type of dice specified.') }
	} else { msg.channel.send('No dice comitted.') }
}

export function leave(msg: Message, players: Player[]) {
	// for (let i = 0; i < duels.length; i++) {
	// 	const duel = duels[i];
	// 	duel.forEach(participant => {
	// 		if (participant.playerData.username === msg.author.username) {
	// 			duels.splice(i, 1)
	// 		}
	// 	});

	// }
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.playerData.username === msg.author.username) {
			msg.channel.send(`${player.playerData} has stepped out.`)
			players.splice(i, 1)
			break
		}
	}
}

export function reroll(msg: Message, args: string[], player: Player) {
	let dice: number[] = []
	const rerollStr: string[] = args[1].split('/')
	if (args[1]) {
		dice = rerollStr[0].split(',').map(die => parseInt(die))
	}
	if (player) {
		if (player.play.length >= dice.length) {
			let oldDice: Dice[] = [...player.play]
			rerollStr[1] != '' ? player.reroll(dice, parseInt(rerollStr[1])) : player.reroll(dice)
			msg.channel.send(`${printDice(oldDice)} -> ${printDice(player.play)}`)
		} else { msg.channel.send('Cannot reroll more dice than you have') }
	}
}

export function help(msg: Message) {

	const embed = new RichEmbed()
		.setTitle(`export functions`)
		.setColor(0xFF0000)
		.setDescription(`
		!help - print this list

		!enter - step into the fight, needs a class, ex: !enter assassin

		!commit - commit a number of dice into play, need a number of dice and type, ex !commit 2d6

		!leave - step out of the fight

		!reroll - reroll an amount of dice, can be used without argument to reroll all, or specifing which dice ex: !reroll, !reroll 2,2

		!mydice - display your currently in play dice

		!sheet - display your character sheet

		!fight - fight another player, ex: !fight @Johny

		!slayers - display available slayers

		!press - gain a pressure token

		!cut - regain a dice if you have enough discarded dice

		!discard - discard your own dice ex: !discard 1,2,3
		`);
	msg.channel.send(embed);
}

export function counter(msg: Message, args: string[], playerOne: Player, players: Player[]) {
	let playerTwo: Player;

	if (playerOne.duel != '') {
		const participants = findDuelParticipants(playerOne.duel, players)
		let twoPlayers: boolean = false
		if (participants.length === 2) {
			twoPlayers = true
			for (let i = 0; i < participants.length; i++) {
				const participant = participants[i];
				if (participant != playerOne) {
					playerTwo = participant
				}
			}
		} else {
			//Add support for non 1v1 fights later.
		}

		if (twoPlayers) {
			switch (args.length) {
				case 1:
					let rerollArr: number[] = []
					let oldDiceOne: Dice[] = [...playerOne.play]
					let oldDiceTwo: Dice[] = [...playerTwo.play]
					for (let i = 0; i < playerOne.play.length; i++) {
						const counteringDie = playerOne.play[i];
						for (let j = playerTwo.play.length - 1; j >= 0; j--) {
							const counteredDie = playerTwo.play[j];
							if (counteringDie.value >= counteredDie.value) {
								rerollArr.push(counteringDie.value);
								playerTwo.counter([counteredDie.value])
								break;
							}
						}
					}
					if (rerollArr.length > 0) {
						playerOne.reroll(rerollArr)
						msg.channel.send(`${printDice(oldDiceOne)} -> ${printDice(playerOne.play)}`)
						msg.channel.send(`${printDice(oldDiceTwo)} -> ${printDice(playerTwo.play)}`)
					} else {
						msg.channel.send('Nothing was countered.')
					}
					break;

				case 4:
					let counteredDice: number[] = args[1]
						.split('/')[0]
						.split(',')
						.map(x => parseInt(x))
					let counteredType: number = parseInt(args[1].split('/')[1])
					let counteringDice: number[] = args[3]
						.split('/')[0]
						.split(',')
						.map(x => parseInt(x))
					let counteringType: number = parseInt(args[3].split('/')[1])

					if (counteringType) {
						let oldDice: Dice[] = playerOne.play
						playerOne.reroll(counteringDice, counteringType)
						msg.channel.send(`${playerOne.playerData}`)
						msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerOne.play)}`)
					} else {
						let oldDice: Dice[] = playerOne.play
						playerOne.reroll(counteringDice)
						msg.channel.send(`${playerOne.playerData}`)
						msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerOne.play)}`)
					}

					if (counteredType) {
						let oldDice: Dice[] = [...playerTwo.play]
						playerTwo.counter(counteredDice, counteredType)
						msg.channel.send(`${playerTwo.playerData}`)
						msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
					} else {
						let oldDice: Dice[] = [...playerTwo.play]
						playerTwo.counter(counteredDice)
						msg.channel.send(`${playerTwo.playerData}`)
						msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
					}
					break;
				default:
					msg.channel.send('Improper arguments')
					break;
			}
		} else { msg.channel.send('!counter is supported for 1v1 duels only currently, use !reroll and !discard manually for bigger duels') }
	} else { msg.channel.send('You are not in a duel') }

}

export function fight(msg: Message, args: string[], playerOne: Player, players: Player[], duels: string[]) {
	if (playerOne) {
		if (playerOne.duel === '') {
			if (args.length === 2) {
				//Id format is : <@Id goes here>
				const playerTwoId: string = args[1].split('@')[1].split('>')[0]
				const playerTwo: Player = findPlayerById(playerTwoId, msg.guild, players)
				if (playerTwo) {
					//Neither player is in a duel yet.
					if (playerTwo.duel === '') {
						//Generate new duel
						const duelId: string = generateRandomString(10);
						duels.push(duelId);
						playerOne.duel = duelId;
						playerTwo.duel = duelId;
					} else {
						playerOne.duel = playerTwo.duel
					}
				} else { msg.channel.send('Other player is not in the fight yet.') }
			} else { msg.channel.send('Need someone to fight against') }
		} else { msg.channel.send(`You're already in a duel.`) }
	} else { msg.channel.send('Step into the fight first.') }
}

export function sheet(msg: Message, player: Player) {
	if (player) {
		let anteString = ''
		player.antes.forEach(ante => {
			anteString += `
						${ante.name}: ${ante.power}d${ante.size}
						Available: ${ante.available ? 'Yes' : 'No'}
						${ante.text}

						`
		})

		const embed = new RichEmbed()
			// Set the title of the field
			.setTitle(`${msg.author.username}'s Character`)
			// Set the color of the embed
			.setColor(0xFF0000)
			// Set the main content of the embed
			.setDescription(`
						Class: ${player.classType}
						Available power: ${player.availablePower}d${player.powerSize}
						Current Pressure: ${player.pressure}
						Pressure tokens: ${player.pressureTokens}
						Dice in discard: ${player.discard}
						Antes:
						${anteString}
						`);
		// Send the embed to the same channel as the message
		msg.channel.send(embed);
	} else {
		msg.channel.send('You are not in the fight yet.')
	}
}

export function ante(msg: Message, args: string[], player: Player) {
	if (args.length >= 2) {
		let anteName = args[1]
		if (player) {
			let ante: Ante = player.ante(anteName)
			if (!!ante) {
				let diceString = printDice(player.play)
				msg.channel.send(`${ante.name}: ${ante.power}d${ante.size}, used\n${diceString}`)
			} else { msg.channel.send('Ante not found/Ante used') }
		}
	} else { msg.channel.send('Enter an ante.') }
}
export function mydice(msg: Message, player: Player) {
	if (player) {
		msg.channel.send(`${msg.author} your dice: ${printDice(player.play, player.pressureTokens)}
		Total pressure: ${player.pressure}
		`)
	} else { msg.channel.send('You have not stepped into a fight yet.') }
}

export function cut(msg: Message, player: Player) {
	if (player) {
		if (player.discard >= player.clock) {
			player.cut(true)
			msg.channel.send(`Your clock is now ${player.clock}, you recovered 1 die`)
		} else {
			player.cut(false)
			msg.channel.send(`Your clock is now ${player.clock}, you have not recovered any dice`)
		}
	} else { msg.channel.send('Not in a fight yet.') }
}

export function press(msg: Message, player: Player) {
	if (player) {
		msg.channel.send(`[Press], current pressure: ${player.press()}`)
	}
}

export function slayers(msg: Message, args: string[], players: Player[], pregens) {
	if (args.length === 2) {
		let slayer = findSlayer(args[1], players)
		if (slayer) {
			let anteString = ''
			slayer.antes.forEach(ante => {
				anteString += `
					${ante.name}: ${ante.power}
					${ante.text}

					`
			})
			const embed = new RichEmbed()
				// Set the title of the field
				.setTitle(`${slayer.name}`)
				// Set the color of the embed
				.setColor(0xFF0000)
				// Set the main content of the embed
				.setDescription(`
				Power: ${slayer.power}
				Antes:
				${anteString}
				`);
			// Send the embed to the same channel as the message
			msg.channel.send(embed);
		}
	} else {
		let slayerString: string = ''
		pregens.slayers.forEach(slayer => {
			slayerString += `${slayer.name}, `
		})
		msg.channel.send(`Current slayers: ${slayerString.slice(0, -2)}`)
	}
}

export function discard(msg: Message, args: string[], player: Player, diceList) {
	if (player) {
		if (player.play.length) {
			const dice: number[] = args[1].split('/')[0].split(',').map(x => parseInt(x))
			const size: number = parseInt(args[1].split('/')[1])
			if (size) {
				player.counter(dice, size)
				let diceString: string = ''
				dice.forEach(die => {
					diceString += `${diceList.d6[die - 1].emoji} `
				});
				msg.channel.send(`${diceString} discarded`)
			} else {
				player.counter(dice)
				let diceString: string = ''
				dice.forEach(die => {
					diceString += `${diceList.d6[die - 1].emoji} `
				});
				msg.channel.send(`${diceString} discarded`)
			}
		} else { msg.channel.send('Nothing to discard.') }
	} else { msg.channel.send('Not in a fight yet.') }
}

export function setPressure(msg: Message, args: string[], player: Player) {
	if (player) {
		const length = player.play.length
		const newPressure: number = parseInt(args[1])
		if (newPressure >= 0 && newPressure >= length) {
			player.pressure = newPressure
			player.pressureTokens = newPressure - length
			msg.channel.send(`Pressure set to ${newPressure}, out of which ${length} dice and ${newPressure - length} tokens`)
		} else { msg.channel.send('New pressure cant be smaller than 0 or smaller than the amount of dice you have out') }
	} else { msg.channel.send('Not in a fight.') }
}

export function setPower(msg: Message, args: string[], player: Player) {
	if (player) {
		const newPower: number = parseInt(args[1])
		if (newPower >= 0) {
			player.availablePower = newPower
			msg.channel.send(`Power set to ${newPower}`)
		}
	} else { msg.channel.send('Not in a fight.') }
}
export function addDice(msg: Message, args: string[], player: Player) {
	if (args.length === 2) {
		if (player) {
			const dice: number[] = args[1].split('/')[0].split(',').map(x => parseInt(x))
			const size: number = parseInt(args[1].split('/')[1])
			if (dice.length != 0) {
				if (size) {
					player.addDice(dice, size)
					const diceString = printDice(player.play, player.pressureTokens)
					msg.channel.send(`${diceString}`)
				} else { msg.channel.send('Size is not a number.') }
			} else { msg.channel.send('Enter dice.') }
		} else { msg.channel.send('Not in a fight.') }
	} else { msg.channel.send('Enter dice.') }
}