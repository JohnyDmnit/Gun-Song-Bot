import { User, Message, Channel, DMChannel } from "./node_modules/discord.js/src"
import { Dice } from "./dice";
import { GM } from "./gm";

export function createGame(msg: Message, gmList: GM[], diceList) {
	const channel: Channel = msg.channel

	let gm: GM = findGM(msg.author, gmList)
	if (gm) {
		sendMsg(channel, `You're already running a game`)
		return
	}

	gm = new GM(msg.author, diceList)
	gmList.push(gm)
	sendMsg(channel, `Congrats ${msg.author.username}, you're now GMing a game!`)
}

export async function add(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	if (!args[1]) {
		sendMsg(channel, `You didn't @ a user`)
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
		sendMsg(channel, `User is already in your game`)
		return
	}

	gm.addPlayer(user)
	sendMsg(channel, `User added`)

}

export function addNPC(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	const npcName = args[1]
	if (!npcName) {
		sendMsg(channel, `You didn't give a name for a NPC`)
		return
	}

	let gm: GM = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.findNPC(npcName)
	if (npc) {
		sendMsg(channel, `NPC already in your game`)
		return
	}

	gm.addNPC(npcName)
	sendMsg(channel, `NPC added`)

}

export function setNPC(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	const npcName = args[1]
	if (!npcName) {
		sendMsg(channel, `You didn't give a name for a NPC`)
		return
	}

	let gm: GM = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.findNPC(npcName)
	if (!npc) {
		sendMsg(channel, `NPC not found, you can add them with !add ${npcName}`)
		return
	}

	gm.currentNPC = npc
	sendMsg(channel, `Current npc: ${npc.name}`)
}

export function listNPC(msg: Message, gmList: GM[]) {
	const channel: Channel = msg.channel

	let gm: GM = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npcString: string = ``
	for (const npc of gm.npcList) {
		npcString += `${npc.name}\n`
	}

	sendMsg(channel, npcString)

}

//Enter a fight
export async function enter(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	if (!args[1]) {
		sendMsg(channel, `You didnt @ a user`)
		return
	}

	let user = await findUserById(msg, args[1])
	if (!user) {
		return
	}

	console.log(JSON.stringify(user))

	let gm: GM = findGM(user, gmList)
	if (!gm) {
		sendMsg(channel, `User is not running a game.`)
		return
	}

	if (gm.userData === msg.author) {
		sendMsg(channel, `You can't be a player in your own game.`)
		return
	}

	let player = gm.findPlayer(msg.author)
	if (player) {
		sendMsg(channel, `You are already in the game.`)
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
		sendMsg(channel, `No dice comitted.`)
		return
	}

	const diceQuantity: number = parseInt(dice.split(`d`)[0])
	if (!(diceQuantity && diceQuantity > 0)) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	const diceSize: number = parseInt(dice.split(`d`)[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
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
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}
	`)
}

//Commit dice into play from power or antes.
export function npcCommit(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	let dice = args[1]
	if (!dice) {
		sendMsg(channel, `No dice comitted.`)
		return
	}

	const diceQuantity: number = parseInt(dice.split(`d`)[0])
	if (!(diceQuantity && diceQuantity > 0)) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	const diceSize: number = parseInt(dice.split(`d`)[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}
	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.commmit(diceQuantity, diceSize)
	sendMsg(channel, `
	${npc.name}
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
	`)
}

//Push dice in play to pay costs
export function push(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.push(diceValues, diceSize);
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}

	Pushed dice:
	${printDice(player.pushed)}
	`)
}

export function npcPush(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.push(diceValues, diceSize);
	sendMsg(channel, `
	${npc.name}
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}

	Pushed dice:
	${printDice(npc.pushed)}
	`)
}

//Remove specified dice from play
export function remove(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.removeDice(diceValues, diceSize);
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}
	`)
}

export function npcRemove(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.removeDice(diceValues, diceSize);
	sendMsg(channel, `
	${npc.name}
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
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

export function npcPress(msg: Message, gmList: GM[]) {
	const channel: Channel = msg.channel
	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	sendMsg(channel, `[Press], current pressure: ${npc.press()}`)
}

export function guard(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	let value = parseInt(args[1])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.guard(value)
	sendMsg(channel, `
	${player.name}
	Dice in play:
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}
	`)
}

export function npcGuard(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel

	let value = parseInt(args[1])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.guard(value)
	sendMsg(channel, `
	${npc.name}
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
	`)

}

export function setPushedDice(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	//Command looks like !setDice x,x,x/y to z, arg[1] is x,x,x/y
	if (!args[1]) {
		sendMsg(channel, `You didn't specify which dice.`)
		return
	}

	//Command looks like !setDice x,x,x/y to z, arg[3] is z
	if (!args[3]) {
		sendMsg(channel, `You didn't specify the value to set the dice to.`)
		return
	}

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let value = parseInt(args[3])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.setDice(diceValues, diceSize, value, player.pushed)
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}

	Pushed dice:
	${printDice(player.pushed)}
	`)

}

export function setPlayDice(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	//Command looks like !setDice x,x,x/y to z, arg[1] is x,x,x/y
	if (!args[1]) {
		sendMsg(channel, `You didn't specify which dice.`)
		return
	}

	//Command looks like !setDice x,x,x/y to z, arg[3] is z
	if (!args[3]) {
		sendMsg(channel, `You didn't specify the value to set the dice to.`)
		return
	}

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let value = parseInt(args[3])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let player = findPlayer(msg.author, gmList)
	if (!player) {
		sendMsg(channel, `You're not a player yet`)
	}

	player.setDice(diceValues, diceSize, value, player.play)
	sendMsg(channel, `
	Dice in play:
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}
	`)

}

export function setNPCPushedDice(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	//Command looks like !setDice x,x,x/y to z, arg[1] is x,x,x/y
	if (!args[1]) {
		sendMsg(channel, `You didn't specify which dice.`)
		return
	}

	//Command looks like !setDice x,x,x/y to z, arg[3] is z
	if (!args[3]) {
		sendMsg(channel, `You didn't specify the value to set the dice to.`)
		return
	}

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let value = parseInt(args[3])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.setDice(diceValues, diceSize, value, npc.pushed)
	sendMsg(channel, `
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}

	Pushed dice:
	${printDice(npc.pushed)}
	`)

}

export function setNPCPlayDice(msg: Message, args: string[], gmList: GM[]) {
	const channel: Channel = msg.channel
	//Command looks like !setDice x,x,x/y to z, arg[1] is x,x,x/y
	if (!args[1]) {
		sendMsg(channel, `You didn't specify which dice.`)
		return
	}

	//Command looks like !setDice x,x,x/y to z, arg[3] is z
	if (!args[3]) {
		sendMsg(channel, `You didn't specify the value to set the dice to.`)
		return
	}

	let diceData = args[1].split(`/`)
	if (!diceData) {
		sendMsg(channel, `Invalid dice data`)
		return
	}

	let value = parseInt(args[3])
	if (!value) {
		sendMsg(channel, `Invalid value`)
		return
	}

	let diceValues = diceData[0].split(`,`).map(dice => parseInt(dice))
	if (!diceValues) {
		sendMsg(channel, `Invalid dice quantity`)
		return
	}

	let diceSize = parseInt(diceData[1])
	if (!(diceSize && diceSize % 2 == 0 && diceSize <= 11)) {
		sendMsg(channel, `Invalid dice size`)
		return
	}

	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.setDice(diceValues, diceSize, value, npc.play)
	sendMsg(channel, `
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
	`)

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
	${printDice(player.play)}
	${momentumToken.repeat(player.pressureTokens)}
	${guardToken.repeat(player.guardTokens)}
	`)
}

export function endNPCTurn(msg: Message, gmList: GM[]) {
	const channel: Channel = msg.channel
	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}

	npc.endTurn()
	sendMsg(channel, `
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
	`)
}

export function test(msg: Message, gmList) {
	const channel: Channel = msg.channel
	let gm = findGM(msg.author, gmList)
	if (!gm) {
		sendMsg(channel, `You're not running a game`)
		return
	}

	let npc = gm.currentNPC
	if (!npc) {
		sendMsg(channel, `NPC not found.`)
		return
	}
	sendMsg(channel, `
	Dice in play:
	${printDice(npc.play)}
	${momentumToken.repeat(npc.pressureTokens)}
	${guardToken.repeat(npc.guardTokens)}
	`)
}

/*
UTILS
*/

// const { RichEmbed } = require('discord.js');
const guardToken: string = `:shield:`
const momentumToken: string = `▫`
const msgSendOptions = {
	split: {
		char: ` `
	}
}

function sendMsg(channel: Channel | DMChannel, content, msgOptions: any = msgSendOptions) {
	channel.send(content, msgOptions)
}

function editMsg(message: Message, content) {
	message.edit(content)
}

//Print a dice array and pressure tokens if supplied.
function printDice(dice?: Dice[]): string {
	const diceArrLen = dice.length
	let diceString: string = ``
	if (diceArrLen) {
		const emojiLength = dice[0].emoji.length + 1
		// Discord messages have a character limit of 2000
		if (emojiLength * diceArrLen <= 1999) {
			for (const i of dice) {
				const die = i.emoji;
				diceString += `${die} `
			}
			// if (pressure) {
			// 	diceString += `${momentumToken} `.repeat(pressure)
			// }
			// if (guard) {
			// 	diceString += `${guardToken} `.repeat(guard)
			// }
		} else {
			let emojiCountArr: string[] = []
			let emojiStoreArr: string[] = []

			for (const i of dice) {
				const die = i.emoji;
				if (emojiStoreArr.includes(die)) {
					emojiCountArr.push(die)
				} else {
					emojiCountArr.push(die)
					emojiStoreArr.push(die)
				}
			}

			for (const emoji of emojiStoreArr) {
				let count = 0
				for (const countEmoji of emojiCountArr) {
					if (emoji === countEmoji) {
						count++
					}
				}
				diceString += `${count}x${emoji} `
				emojiCountArr.splice(0, count)
			}
			// if (pressure) {
			// 	diceString += `${momentumToken} `.repeat(pressure)
			// }
		}
	}
	return diceString ? diceString : "No dice"
}

function findGM(user: User, gmList: GM[]) {
	for (const gm of gmList) {
		if (gm.userData === user) {
			return gm;
		}
	}
	return null
}

function findPlayer(user: User, gmList: GM[]) {
	for (const gm of gmList) {
		let player = gm.findPlayer(user)
		if (player) {
			return player
		}
	}
	return null
}

async function findUserById(msg: Message, id: string) {
	const channel: Channel = msg.channel
	let gmID = id.split(`!`)[1].split(`>`)[0] //Get the user ID out of the @user 
	if (!gmID) {
		sendMsg(channel, `You didnt @ a user`)
		return null
	}

	/*
	guild is the server the message was sent in
	members are the guildmembers in that server
	cache returns a collection of members instead of an object
	get find the guildmember by key, the key in this case being a users ID
	user returns the user that guildmember
	*/
	let user: User = await msg.guild.members.cache.get(gmID).user
	if (!user) {
		sendMsg(channel, `You didnt @ a user on the same server`)
		return null
	}

	return user
}