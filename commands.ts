import { Dice } from "./dice";
import { User, Message, Channel, DMChannel } from "./node_modules/discord.js/src"
import { GM } from "./gm";
import { Player } from "./player";
// import { Ante } from "./ante";

export function createGame(msg: Message, gmList: GM[], diceList) {
	const channel: Channel = msg.channel

	let gm: GM = findGM(msg.author, gmList)
	if (gm) {
		sendMsg(channel, `You're already running a game`)
		return
	}

	gm = new GM(msg.author, diceList)
	gmList.push(gm)
	sendMsg(channel, `Congrats ${msg.author}, you're now GMing a game!`)
}

export async function add(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	if (!args[1]) {
		sendMsg(channel, 'You didnt @ a user')
		return
	}

	let user = await findUserById(msg, args[1])
	if (!user) {
		return
	}

	let gm: GM = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}
	
	let player = gm.findPlayer(user)
	if (player) {
		sendMsg(channel, 'User already in your game')
		return
	}

	gm.addPlayer(user)
	sendMsg(channel, `User added`)


}

//Enter a fight
export async function enter(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	
	if (!args[1]) {
		sendMsg(channel, 'You didnt @ a user')
		return
	}

	let user = await findUserById(msg, args[1])
	if (!user) {
		return
	}

	console.log(JSON.stringify(user))

	let gm: GM = findGM(user, gmList)

	if (!gm) {
		sendMsg(channel, `User is not running a game`)
		return
	}

	let player = gm.findPlayer(msg.author)
	if (player) {
		sendMsg(channel, 'You are already in the game')
		return
	}

	gm.addPlayer(msg.author)
	sendMsg(channel, `Entered the game.`)

}

//Commit dice into play from power or antes.
export function commit(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	let dice = args[1]
	if (!dice) {
		sendMsg(channel, 'No dice comitted.')
		return
	}

	const diceQuantity: number = parseInt(dice.split('d')[0])
	if (!(diceQuantity && diceQuantity > 0)) {
		sendMsg(channel, 'Invalid dice quantity')
		return
	}

	const diceSize: number = parseInt(dice.split('d')[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, 'Invalid dice size')
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
		return
	}

	player.commmit(diceQuantity, diceSize)
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play, player.pressureTokens)}
	`)
}

//Push dice in play to pay costs
export function push(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	let diceData = args[1].split('/')
	if (!diceData) {
		sendMsg(channel, 'Invalid dice data')
		return
	}

	let diceValues = diceData[0].split(',').map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, 'Invalid dice quantity')
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, 'Invalid dice size')
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.push(diceValues, diceSize);
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play, player.pressureTokens)}

	Pushed dice:
	${printDice(player.pushed)}
	`)
}

//Remove specified dice from play
export function remove(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	let diceData = args[1].split('/')
	if (!diceData) {
		sendMsg(channel, 'Invalid dice data')
		return
	}

	let diceValues = diceData[0].split(',').map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, 'Invalid dice quantity')
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, 'Invalid dice size')
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.removeDice(diceValues, diceSize);
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play, player.pressureTokens)}
	`)
}


export function press(msg: Message, gmList: GM[]) {
	const channel: Channel = msg.channel
	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	sendMsg(channel, `[Press], current pressure: ${player.press()}`)
}

export function endTurn(msg: Message, gmList: GM[]) {
	const channel: Channel = msg.channel
	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.endTurn()
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play, player.pressureTokens)}
	`)
}

/*
UTILS
*/

// const { RichEmbed } = require('discord.js');
const tokenEmoji = '▫'
const msgSendOptions = {
	split: {
		char: ' '
	}
}

//Initialize the dice list with emojis and proper dice objects
export function initDice(diceList: any, client) {
	client.emojis.cache.forEach(emoji => {
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

function findGM(user: User, gmList: GM[]) {
	for (let i = 0; i < gmList.length; i++) {
		const gm = gmList[i];
		console.log(gm.userData)
		if (gm.userData === user) {
			return gm;
		}
	}
	return null
}

function findPlayer(user: User, gmList) {
	for (let i = 0; i < gmList.length; i++) {
		const gm = gmList[i];
		let player = gm.findPlayer(user)
		if (player) {
			return player
		}
	}
	return null
}

async function findUserById(msg: Message, id: string) {
	const channel: Channel = msg.channel
	let gmID = id.split('!')[1].split('>')[0] //Get the user ID out of the @user 
	if (!gmID) {
		sendMsg(channel, 'You didnt @ a user')
		return null
	}

	let user: User = await msg.guild.members.cache.get(gmID).user
	if (!user) {
		sendMsg(channel, 'You didnt @ a user on the same server')
		return null
	}

	return user
}