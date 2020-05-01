import { Dice } from "./dice";
import { Player } from "./player";
import { Guild, User, Message, Channel, DMChannel } from "./node_modules/discord.js/src"
import { Game } from "./game";
// import { Ante } from "./ante";

// const { RichEmbed } = require('discord.js');
const tokenEmoji = '▫'
const msgSendOptions = {
	split: {
		char: ' '
	}
}
//Initialize the dice list with emojis and proper dice objects
export function initDice(diceList: any, client) {
	client.emojis.forEach(emoji => {
		if (
			emoji.name.startsWith('d4') ||
			emoji.name.startsWith('d6') ||
			emoji.name.startsWith('d8') ||
			emoji.name.startsWith('d10')
		) {
			let emojiString = emoji.toString()
			let format: string[] = emojiString.split(':')
			let type: string = ''
			let value: number = 0
			if (format.length != 1) {
				let emojiFormat: string[] = format[1].split('_')
				type = emojiFormat[0]
				value = parseInt(emojiFormat[1])

			}
			diceList[type].push({ value: value, emoji: emojiString })
			diceList[type].sort((a, b) => a.value - b.value)
		}
	})
	// console.log(JSON.stringify(diceList))
}

function sendMsg(channel: Channel | DMChannel, content, msgOptions: any = msgSendOptions) {
	channel.send(content, msgOptions)
}

function editMsg(message: Message, content) {
	message.edit(content)
}

//Print a dice array and pressure tokens if supplied.
function printDice(dice: Dice[], pressureTokens?: number): string {
	const diceArrLen = dice.length
	let diceString: string = ''
	if (diceArrLen) {
		const emojiLength = dice[0].emoji.length + 1
		if (emojiLength * diceArrLen <= 1999) {
			for (let i = 0; i < diceArrLen; i++) {
				const die = dice[i].emoji;
				diceString += `${die} `
			}
			if (pressureTokens) {
				for (let i = 0; i < pressureTokens; i++) {
					diceString += `${tokenEmoji} `
				}
			}
		} else {
			let emojiCountArr: string[] = []
			let emojiStoreArr: string[] = []
			for (let i = 0; i < diceArrLen; i++) {
				const die = dice[i].emoji;
				if (emojiStoreArr.includes(die)) {
					emojiCountArr.push(die)
				} else {
					emojiCountArr.push(die)
					emojiStoreArr.push(die)
				}
			}
			const emojiStoreArrLen = emojiStoreArr.length
			const emojiCountArrLen = emojiCountArr.length
			for (let i = 0; i < emojiStoreArrLen; i++) {
				const emoji = emojiStoreArr[i];
				let count = 0
				for (let j = 0; j < emojiCountArrLen; j++) {
					const countEmoji = emojiCountArr[j];
					if (emoji === countEmoji) {
						count++
					}
				}
				diceString += `${count}x${emoji} `
				emojiCountArr.splice(0, count)
			}
			if (pressureTokens) {
				for (let i = 0; i < pressureTokens; i++) {
					diceString += `${tokenEmoji} `
				}
			}
		}
	}
	return diceString ? diceString : "No dice"
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

//Enter a fight
export function enter(msg: Message, args: string[], player: Player, players: Player[], diceList) {
	const channel = msg.channel
	// let classType: string = msg.content.split(' ')[1].toUpperCase()
	// if (!!classType) {
	if (players) {
		if (player) {
			sendMsg(channel, `${player.playerData} has already stepped into the game`)
		} else {
			// let slayer = findSlayer(classType, pregens)
			// if (slayer) {
			players.push(new Player(msg.author, diceList))
			sendMsg(channel, `${msg.author} has stepped into the game`)
			// } else { sendMsg(channel, 'Class doesnt exist, yet?') }
		}
	}
	// } else {
	// 	sendMsg(channel, `No class entered`)
	// }
}

//Commit dice into play from power or antes.
export function commit(msg: Message, args: string[], player: Player) {
	const channel = msg.channel
	let dice = args[1]
	if (dice) {
		const n: number = parseInt(dice.split('d')[0])
		const size: number = parseInt(dice.split('d')[1])
		if (size) {
			if (n) {
				if (size === 4 || size === 6 || size === 8 || size === 10) {
					if (n > 0) {
						if (player) {
							player.commmit(n, size)
							sendMsg(channel, "Dice in play:")
							sendMsg(channel, printDice(player.play, player.pressureTokens))
						} else { sendMsg(channel, `${msg.author} has not stepped into the current fight.`) }
					} else { sendMsg(channel, 'Cannot commit 0 or negative dice.') }
				} else { sendMsg(channel, 'Can only commit d4, d6, d8, d10.') }
			} else { sendMsg(channel, 'No ammount of dice specified.') }
		} else { sendMsg(channel, 'No type of dice specified.') }
	} else { sendMsg(channel, 'No dice comitted.') }
}

//Push dice in play to pay costs
export function push(msg: Message, args: string[], player: Player) {
	const channel = msg.channel
	let diceData = args[1].split('/')
	let diceValues = diceData[0].split(',').map(dice => parseInt(dice))
	let diceType = parseInt(diceData[1])
	player.push(diceValues, diceType);
	sendMsg(channel, "Dice in play:")
	sendMsg(channel, printDice(player.play, player.pressureTokens))
	sendMsg(channel, "Pushed dice:")
	sendMsg(channel, printDice(player.pushed))
}

//Remove specified dice from play
export function remove(msg: Message, args: string[], player: Player) {
	const channel = msg.channel
	let diceData = args[1].split('/')
	let diceValues = diceData[0].split(',').map(dice => parseInt(dice))
	let diceType = parseInt(diceData[1])
	player.removeDice(diceValues, diceType);
	sendMsg(channel, "Dice in play:")
	sendMsg(channel, printDice(player.play, player.pressureTokens))
	sendMsg(channel, "Pushed dice:")
	sendMsg(channel, printDice(player.pushed))
}


export function press(msg: Message, player: Player) {
	const channel = msg.channel

	if (player) {
		sendMsg(channel, `[Press], current pressure: ${player.press()}`)
	}
}

export function endTurn(msg: Message, player: Player) {
	const channel = msg.channel

	if (player) {
		player.endTurn()
		sendMsg(channel, "Dice in play:")
		sendMsg(channel, printDice(player.play, player.pressureTokens))
	}
}

//Find a player in the server the message was sent in by Id.
export function findUserById(args: string[], guild: Guild, /*game: Game*/ diceList): User {
	console.log(JSON.stringify(guild))
	// const user: User = guild.fetch().members.fetch(args[1])
	// console.log(user)
	// const player: Player = new Player(user, diceList)
	// game.addPlayer(player)
}
// //Generate a random string
// function generateRandomString(length: number) {
// 	const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
// 	const charactersLength = characters.length;
// 	let res: string = ''
// 	for (let i = 0; i < length; i++) {
// 		res += characters[Math.floor(Math.random() * charactersLength)];
// 	}
// 	return res
// }

// //Find a slayer in the pregens json
// function findSlayer(slayerName: string, pregens) {
// 	for (let i = 0; i < pregens.slayers.length; i++) {
// 		const slayer = pregens.slayers[i];
// 		if (slayer.name.toUpperCase().startsWith(slayerName.toUpperCase())) {
// 			return slayer;
// 		}
// 	}
// }
// //Find duel participants by duel id
// function findDuelParticipants(duelId: string, players: Player[]): Player[] {
// 	let participants: Player[] = []
// 	for (let i = 0; i < players.length; i++) {
// 		const player = players[i];
// 		if (player.duel === duelId) {
// 			participants.push(player)
// 		}
// 	}
// 	return participants
// }



// //Return a string/embedd with the current player sheet.
// function printSheetEmbed(player: Player, msg: Message) {
// 	let anteString = ''
// 	const diceString: string = printDice(player.play)
// 	player.antes.forEach(ante => {
// 		anteString += `
// 						${ante.name}: ${ante.power}d${ante.size}
// 						Available: ${ante.available ? 'Yes' : 'No'}
// 						${ante.text}

// 						`
// 	})

// 	const embed = new RichEmbed()
// 		// Set the title of the field
// 		.setTitle(`${msg.author.username}'s Character`)
// 		// Set the color of the embed
// 		.setColor(0xFF0000)
// 		// Set the main content of the embed
// 		.setDescription(`
// 						Class: ${player.classType}
// 						Available power: ${player.availablePower}d${player.powerSize}
// 						Dice in play: ${diceString}
// 						Current Pressure: ${player.pressure}
// 						Pressure tokens: ${player.pressureTokens}
// 						Dice in discard: ${player.discard}
// 						Antes:
// 						${anteString}
// 						`);
// 	return embed
// }




// export function leave(msg: Message, players: Player[]) {
// 	const channel = msg.channel
// 	// for (let i = 0; i < duels.length; i++) {
// 	// 	const duel = duels[i];
// 	// 	duel.forEach(participant => {
// 	// 		if (participant.playerData.username === msg.author.username) {
// 	// 			duels.splice(i, 1)
// 	// 		}
// 	// 	});

// 	// }
// 	for (let i = 0; i < players.length; i++) {
// 		const player = players[i];
// 		if (player.playerData.username === msg.author.username) {
// 			sendMsg(channel, `${player.playerData} has stepped out.`)
// 			players.splice(i, 1)
// 			break
// 		}
// 	}
// }

// export function reroll(msg: Message, args: string[], player: Player) {
// 	const channel = msg.channel
// 	let dice: number[] = []
// 	const rerollStr: string[] = args[1].split('/')
// 	if (args[1]) {
// 		dice = rerollStr[0].split(',').map(die => parseInt(die))
// 	}
// 	if (player) {
// 		if (player.play.length >= dice.length) {
// 			let oldDice: Dice[] = [...player.play]
// 			rerollStr[1] != '' ? player.reroll(dice, parseInt(rerollStr[1])) : player.reroll(dice)
// 			sendMsg(channel, `${printDice(oldDice)} -> ${printDice(player.play)}`)
// 		} else { sendMsg(channel, 'Cannot reroll more dice than you have') }
// 	}
// }

// export function help(msg: Message, args: string[]) {
// 	const dmChannel = msg.author.dmChannel;
// 	const channel = msg.channel;
// 	const commandList: string = 'Available commands, use as argument for details:\n!help, !enter, !commit, !leave, !sheet, !fight, !counter, !reroll, !mydice, !press, !ante, !slayers, !cut, !discard, !setPressure, !setPower, !addDice'
// 	let command: string = ''
// 	if (args[1]) {
// 		switch (args[1]) {
// 			case '!help':
// 				command = 'Print this list'
// 				break;
// 			case '!enter':
// 				command = 'Enter the fight by selecting a class, ex: !enter Berserker'
// 				break;
// 			case '!commit':
// 				command = 'Commit dice from your power pool, ex: !commit 4'
// 				break;
// 			case '!leave':
// 				command = 'Leave the fight'
// 				break;
// 			case '!sheet':
// 				command = 'Display your character sheet'
// 				break;
// 			case '!fight':
// 				command = 'Duel a particular player ex: !duel @someone'
// 				break;
// 			case '!counter':
// 				command = 'Counter dice, can take multiple arguments, !counter, no arguments, optimaly counters dice, !counter x with y, counters specific dice disregarding dice type, !counter x/X with y/Y, counters specific type taking the type of the dice into account.'
// 				break;
// 			case '!reroll':
// 				command = 'Reroll some dice you currently have, can be specific by type, ex: !reroll 1,2,3 !reroll 1,2,3/4'
// 				break;
// 			case '!mydice':
// 				command = 'Display your current in play dice and how many pressure tokens you have, ex: !mydice'
// 				break;
// 			case '!press':
// 				command = 'Increase your pressure with pressure tokens, ex: !press'
// 				break;
// 			case '!ante':
// 				command = 'Commit an ante into play, ex: !ante Overclock'
// 				break;
// 			case '!slayers':
// 				command = 'Display available slayers to play, use slayer as argument to get detail, ex: !slayers, !slayers Assassin'
// 				break;
// 			case '!cut':
// 				command = 'Advance the clock, if you have enough dice in the discard you gain one die to your power, ex: !cut'
// 				break;
// 			case '!discard':
// 				command = 'Discard dice from your own dice pool, can be specific to dice type ex: !discard 4, !discard 4/6'
// 				break;
// 			case '!setPower':
// 				command = 'Set your power to an arbitrary value, ex: !setPower 10'
// 				break;
// 			case '!setPressure':
// 				command = 'Set pressure to an arbitrary value, cannot be lower than the amount of dice you have in play, ex: !setPressure'
// 				break;
// 			case '!addDice':
// 				command = 'Add arbitrary dice into play, dice type is after slash, ex: !addDice 1,2,3,4/6'
// 				break;
// 			default:
// 				command = 'No valid command entered'
// 				break;
// 		}
// 		sendMsg(dmChannel, `${args[1]} - ${command}`);
// 		if (channel.id != dmChannel.id) {
// 			sendMsg(channel, `${msg.author} check your PM's!`);
// 		}
// 	} else {
// 		sendMsg(dmChannel, commandList)
// 		if (channel.id != dmChannel.id) {
// 			sendMsg(channel, `${msg.author} check your PM's!`);
// 		}
// 	}
// }

// export function counter(msg: Message, args: string[], playerOne: Player, players: Player[]) {
// 	const channel = msg.channel
// 	let playerTwo: Player;

// 	if (playerOne.duel != '') {
// 		const participants = findDuelParticipants(playerOne.duel, players)
// 		let twoPlayers: boolean = false
// 		if (participants.length === 2) {
// 			twoPlayers = true
// 			for (let i = 0; i < participants.length; i++) {
// 				const participant = participants[i];
// 				if (participant != playerOne) {
// 					playerTwo = participant
// 				}
// 			}
// 		} else {
// 			//Add support for non 1v1 fights later.
// 		}

// 		if (twoPlayers) {
// 			switch (args.length) {
// 				case 1:
// 					let rerollArr: number[] = []
// 					let oldDiceOne: Dice[] = [...playerOne.play]
// 					let oldDiceTwo: Dice[] = [...playerTwo.play]
// 					for (let i = 0; i < playerOne.play.length; i++) {
// 						const counteringDie = playerOne.play[i];
// 						for (let j = playerTwo.play.length - 1; j >= 0; j--) {
// 							const counteredDie = playerTwo.play[j];
// 							if (counteringDie.value >= counteredDie.value) {
// 								rerollArr.push(counteringDie.value);
// 								playerTwo.counter([counteredDie.value])
// 								break;
// 							}
// 						}
// 					}
// 					if (rerollArr.length > 0) {
// 						playerOne.reroll(rerollArr)
// 						sendMsg(channel, `${printDice(oldDiceOne)} -> ${printDice(playerOne.play)}`)
// 						sendMsg(channel, `${printDice(oldDiceTwo)} -> ${printDice(playerTwo.play)}`)
// 					} else {
// 						sendMsg(channel, 'Nothing was countered.')
// 					}
// 					break;

// 				case 4:
// 					let counteredDice: number[] = args[1]
// 						.split('/')[0]
// 						.split(',')
// 						.map(x => parseInt(x))
// 					let counteredType: number = parseInt(args[1].split('/')[1])
// 					let counteringDice: number[] = args[3]
// 						.split('/')[0]
// 						.split(',')
// 						.map(x => parseInt(x))
// 					let counteringType: number = parseInt(args[3].split('/')[1])

// 					if (counteringType) {
// 						let oldDice: Dice[] = playerOne.play
// 						playerOne.reroll(counteringDice, counteringType)
// 						sendMsg(channel, `${playerOne.playerData}`)
// 						sendMsg(channel, `${printDice(oldDice)} -> ${printDice(playerOne.play)}`)
// 					} else {
// 						let oldDice: Dice[] = playerOne.play
// 						playerOne.reroll(counteringDice)
// 						sendMsg(channel, `${playerOne.playerData}`)
// 						sendMsg(channel, `${printDice(oldDice)} -> ${printDice(playerOne.play)}`)
// 					}

// 					if (counteredType) {
// 						let oldDice: Dice[] = [...playerTwo.play]
// 						playerTwo.counter(counteredDice, counteredType)
// 						sendMsg(channel, `${playerTwo.playerData}`)
// 						sendMsg(channel, `${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
// 					} else {
// 						let oldDice: Dice[] = [...playerTwo.play]
// 						playerTwo.counter(counteredDice)
// 						sendMsg(channel, `${playerTwo.playerData}`)
// 						sendMsg(channel, `${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
// 					}
// 					break;
// 				default:
// 					sendMsg(channel, 'Improper arguments')
// 					break;
// 			}
// 		} else { sendMsg(channel, '!counter is supported for 1v1 duels only currently, use !reroll and !discard manually for bigger duels') }
// 	} else { sendMsg(channel, 'You are not in a duel') }

// }

// export function fight(msg: Message, args: string[], playerOne: Player, players: Player[], duels: string[]) {
// 	const channel = msg.channel
// 	if (playerOne) {
// 		if (playerOne.duel === '') {
// 			if (args.length === 2) {
// 				//Id format is : <@Id goes here>
// 				const playerTwoId: string = args[1].split('@')[1].split('>')[0]
// 				const playerTwo: Player = findPlayerById(playerTwoId, msg.guild, players)
// 				if (playerTwo) {
// 					//Neither player is in a duel yet.
// 					if (playerTwo.duel === '') {
// 						//Generate new duel
// 						const duelId: string = generateRandomString(10);
// 						duels.push(duelId);
// 						playerOne.duel = duelId;
// 						playerTwo.duel = duelId;
// 					} else {
// 						playerOne.duel = playerTwo.duel
// 					}
// 				} else { sendMsg(channel, 'Other player is not in the fight yet.') }
// 			} else { sendMsg(channel, 'Need someone to fight against') }
// 		} else { sendMsg(channel, `You're already in a duel.`) }
// 	} else { sendMsg(channel, 'Step into the fight first.') }
// }

// export async function sheet(msg: Message, player: Player) {
// 	const channel = msg.channel
// 	const dmChannel = msg.author.dmChannel
// 	if (player) {
// 		const embed = printSheetEmbed(player, msg)
// 		// Send the embed to the same channel as the message
// 		const messageOptions = {
// 			embed: embed
// 		}
// 		if (!player.sheetMessage) {
// 			let message: Message = await sendMsg(dmChannel, '', messageOptions);
// 			player.sheetMessage = message
// 		} else {
// 			editMsg(player.sheetMessage, embed)
// 		}
// 	} else {
// 		sendMsg(channel, 'You are not in the fight yet.')
// 	}
// }

// export function ante(msg: Message, args: string[], player: Player) {
// 	const channel = msg.channel
// 	if (args.length >= 2) {
// 		let anteName = args[1]
// 		if (player) {
// 			let ante: Ante = player.ante(anteName)
// 			if (!!ante) {
// 				let diceString = printDice(player.play)
// 				sendMsg(channel, `${ante.name}: ${ante.power}d${ante.size}, used\n${diceString}`)
// 			} else { sendMsg(channel, 'Ante not found/Ante used') }
// 		}
// 	} else { sendMsg(channel, 'Enter an ante.') }
// }
// export function mydice(msg: Message, player: Player) {
// 	const channel = msg.channel
// 	if (player) {
// 		sendMsg(channel, `${msg.author} your dice: ${printDice(player.play, player.pressureTokens)}
// 		Total pressure: ${player.pressure}
// 		`)
// 	} else { sendMsg(channel, 'You have not stepped into a fight yet.') }
// }

// export function cut(msg: Message, player: Player) {
// 	const channel = msg.channel
// 	if (player) {
// 		if (player.discard >= player.clock) {
// 			player.cut(true)
// 			sendMsg(channel, `Your clock is now ${player.clock}, you recovered 1 die`)
// 		} else {
// 			player.cut(false)
// 			sendMsg(channel, `Your clock is now ${player.clock}, you have not recovered any dice`)
// 		}
// 	} else { sendMsg(channel, 'Not in a fight yet.') }
// }


// export function slayers(msg: Message, args: string[], players: Player[], pregens) {
// 	const channel = msg.author.dmChannel
// 	if (args.length === 2) {
// 		let slayer = findSlayer(args[1], players)
// 		if (slayer) {
// 			let anteString = ''
// 			slayer.antes.forEach(ante => {
// 				anteString += `
// 					${ante.name}: ${ante.power}
// 					${ante.text}

// 					`
// 			})
// 			const embed = new RichEmbed()
// 				// Set the title of the field
// 				.setTitle(`${slayer.name}`)
// 				// Set the color of the embed
// 				.setColor(0xFF0000)
// 				// Set the main content of the embed
// 				.setDescription(`
// 				Power: ${slayer.power}
// 				Antes:
// 				${anteString}
// 				`);
// 			// Send the embed to the same channel as the message
// 			sendMsg(channel, embed);
// 		}
// 	} else {
// 		let slayerString: string = ''
// 		pregens.slayers.forEach(slayer => {
// 			slayerString += `${slayer.name}, `
// 		})
// 		sendMsg(channel, `Current slayers: ${slayerString.slice(0, -2)}`)
// 	}
// }

// export function discard(msg: Message, args: string[], player: Player, diceList) {
// 	const channel = msg.channel
// 	if (player) {
// 		if (player.play.length) {
// 			if (args.length === 2) {
// 				const dice: number[] = args[1].split('/')[0].split(',').map(x => parseInt(x))
// 				const size: number = parseInt(args[1].split('/')[1])
// 				if (size) {
// 					player.counter(dice, size)
// 					let diceString: string = ''
// 					dice.forEach(die => {
// 						diceString += `${diceList.d6[die - 1].emoji} `
// 					});
// 					sendMsg(channel, `${diceString} discarded`)
// 				} else {
// 					player.counter(dice)
// 					let diceString: string = ''
// 					dice.forEach(die => {
// 						diceString += `${diceList.d6[die - 1].emoji} `
// 					});
// 					sendMsg(channel, `${diceString} discarded`)
// 				}
// 			} else { sendMsg(channel, 'Not enough arguments.') }
// 		} else { sendMsg(channel, 'Nothing to discard.') }
// 	} else { sendMsg(channel, 'Not in a fight yet.') }
// }

// export function setPressure(msg: Message, args: string[], player: Player) {
// 	const channel = msg.channel
// 	if (player) {
// 		const length = player.play.length
// 		const newPressure: number = parseInt(args[1])
// 		if (newPressure >= 0 && newPressure >= length) {
// 			player.pressure = newPressure
// 			player.pressureTokens = newPressure - length
// 			sendMsg(channel, `Pressure set to ${newPressure}, out of which ${length} dice and ${newPressure - length} tokens`)
// 		} else { sendMsg(channel, 'New pressure cant be smaller than 0 or smaller than the amount of dice you have out') }
// 	} else { sendMsg(channel, 'Not in a fight.') }
// }

// export function setPower(msg: Message, args: string[], player: Player) {
// 	const channel = msg.channel
// 	if (player) {
// 		const newPower: number = parseInt(args[1])
// 		if (newPower >= 0) {
// 			player.availablePower = newPower
// 			sendMsg(channel, `Power set to ${newPower}`)
// 		}
// 	} else { sendMsg(channel, 'Not in a fight.') }
// }
// export function addDice(msg: Message, args: string[], player: Player) {
// 	const channel = msg.channel
// 	if (args.length === 2) {
// 		if (player) {
// 			const dice: number[] = args[1].split('/')[0].split(',').map(x => parseInt(x))
// 			const size: number = parseInt(args[1].split('/')[1])
// 			if (dice.length != 0) {
// 				if (size) {
// 					player.addDice(dice, size)
// 					const diceString = printDice(player.play, player.pressureTokens)
// 					sendMsg(channel, `${diceString}`)
// 				} else { sendMsg(channel, 'Size is not a number.') }
// 			} else { sendMsg(channel, 'Enter dice.') }
// 		} else { sendMsg(channel, 'Not in a fight.') }
// 	} else { sendMsg(channel, 'Enter dice.') }
// }