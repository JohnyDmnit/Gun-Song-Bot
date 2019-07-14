import { Player } from "./player";
import { Dice } from "./dice";

const Discord = require('discord.js');
const { Client, RichEmbed } = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const guildList = require('./guilds.json');
const pregens = require('./pregens.json');


const botName: string = 'Gun Song Bot'
let diceList = {
	d4: [],
	d6: [],
	d8: [],
	d10: [],
};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	// console.log(client.guilds.map(guild => {return {name: guild.name, id: guild.id}}))
	initDice(diceList)
	// initGunSongGuild(guildList.gs.id)
});

let players: Player[] = [];
let duels: any[] = [];
let gsGuild: any;
function initGunSongGuild(guildId: number) {
	client.guilds.forEach(guild => {
		if (guild.id === guildId) {
			gsGuild = guild
		}
	});
}

function initDice(diceList: any) {
	client.emojis.forEach(emoji => {
		if (
			emoji.name.startsWith('d4') ||
			emoji.name.startsWith('d6') ||
			emoji.name.startsWith('d8') ||
			emoji.name.startsWith('d10')
		) {
			let dice: Dice = new Dice(emoji.toString())
			diceList[dice.type].push(dice)
			diceList[dice.type].sort((a, b) => a.value - b.value)
		}
	})
}

function dice(n) {
	return Math.ceil(Math.random() * n)
}

function findPlayer(playerData) {
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.playerData.username === playerData.username) {
			return player
		}
	}
}

function open(msg) {
	let classType: string = msg.content.split(' ')[1].toUpperCase()
	if (!!classType) {
		if (players) {
			let player: Player = findPlayer(msg.author)
			if (player) {
				msg.channel.send(`${player.playerData} has already stepped into the fight`)
			} else {
				let classExists: boolean = false
				pregens.slayers.forEach(pregen => {
					if (pregen.name.toUpperCase() === classType) {
						classExists = true
						players.push(new Player(pregen.power, msg.author, diceList, pregen.antes, pregen.name))
						msg.channel.send(`${msg.author} has stepped into the fight as an ${pregen.name}`)
					}
				});
				if (!classExists) {
					msg.channel.send('Class doesnt exist, yet?')
				}
			}
		}
	} else {
		msg.channel.send(`No class entered`)
	}
}

function printDice(dice: Dice[]) {
	let diceString: string = ''
	for (let i = 0; i < dice.length; i++) {
		const die = dice[i];
		diceString += `${die.emoji} `
	}
	return diceString
}

function commit(msg) {
	let dice = msg.content.split(' ')[1]
	if (dice) {
		const n: number = parseInt(dice.split('d')[0])
		const size: number = parseInt(dice.split('d')[1])
		if (size) {
			if (n) {
				if (size === 4 || size === 6 || size === 8 || size === 10) {
					if (n > 0) {
						let player: Player = findPlayer(msg.author)
						if (player) {
							if (player.availablePower - n >= 0) {
								player.push(n, size)
								msg.channel.send(printDice(player.play))
							} else { msg.channel.send(`Cannot over commit, you currently have ${player.availablePower} power left`) }
						} else { msg.channel.send(`${msg.author} has not stepped into the current fight`) }
					} else { msg.channel.send('Cannot commit 0 or negative dice') }
				} else { msg.channel.send('Can only commit d4, d6, d8, d10') }
			} else { msg.channel.send('No ammount of dice specified') }
		} else { msg.channel.send('No type of dice specified') }
	} else { msg.channel.send('No dice comitted') }
}


function remove(msg) {
	for (let i = 0; i < duels.length; i++) {
		const duel = duels[i];
		duel.forEach(participant => {
			if (participant.playerData.username === msg.author.username) {
				duels.splice(i, 1)
			}
		});

	}
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.playerData.username === msg.author.username) {
			msg.channel.send(`${player.playerData} has been removed`)
			players.splice(i, 1)
			break
		}
	}
}

function reroll(msg) {
	let splitMsg = msg.content.split(' ')
	let dice: number[] = []
	if (splitMsg[1]) {
		dice = splitMsg[1].split(',').map(die => parseInt(die))
	}
	let player: Player = findPlayer(msg.author)
	if (player) {
		if (player.play.length >= dice.length) {
			let oldDice: Dice[] = [...player.play]
			player.reroll(dice)
			msg.channel.send(`${printDice(oldDice)} -> ${printDice(player.play)}`)
		} else { msg.channel.send('Cannot reroll more dice than you have') }
	}
}

function help(msg) {

	const embed = new RichEmbed()
		.setTitle(`Functions`)
		.setColor(0xFF0000)
		.setDescription(`
		!help - print this list

		!open - step into the fight, needs a class, ex: !open assassin

		!commit - commit a number of dice into play, need a number of dice and type, ex !commit 2d6

		!remove - remove yourself from the fight

		!reroll - reroll an amount of dice, can be used without argument to reroll all, or specifing which dice ex: !reroll, !reroll 2,2

		!mydice - display your currently in play dice

		!sheet - display your character sheet

		!fight - fight another player, ex: !fight @Johny
		`);
	msg.channel.send(embed);
}

function counter(msg) {
	let arg: string = msg.content.split(' ')
	if (arg.length === 4) {
		let isDueling: boolean = false;
		let playerOne: Player;
		let playerTwo: Player;
		let currentDuel: any[];

		duels.forEach(duel => {
			duel.forEach(participant => {
				if (participant.playerData.username === msg.author.username) {
					isDueling = true
					currentDuel = [...duel]
				}
			});
		});

		if (isDueling) {
			if (currentDuel[0].playerData.username === msg.author.username) {
				playerOne = currentDuel[0]
				playerTwo = currentDuel[1]
			} else {
				playerOne = currentDuel[1]
				playerTwo = currentDuel[0]
			}

			let counteredDice: number[] = arg[1]
				.split('/')[0]
				.split(',')
				.map(x => parseInt(x))
			let counteredType: string = arg[1].split('/')[1]
			let counteringDice: number[] = arg[3]
				.split('/')[0]
				.split(',')
				.map(x => parseInt(x))
			let counteringType: string = arg[3].split('/')[1]

			if (counteringType) {

			} else {
				let oldDice: Dice[] = playerOne.play
				playerOne.reroll(counteringDice)
				msg.channel.send(`${playerOne.playerData}`)
				msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerOne.play)}`)
			}

			if (counteredType) {

			} else {
				let oldDice: Dice[] = [...playerTwo.play]
				playerTwo.counter(counteredDice)
				msg.channel.send(`${playerTwo.playerData}`)
				msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
			}
		} else { msg.channel.send('You are not in a duel') }

	} else { msg.channel.send('Improper arguments') }
}

function fight(msg) {
	let playerOne: Player = findPlayer(msg.author)
	let playerTwo: Player;
	if (playerOne) {
		let arg: string = msg.content.split(' ')[1]
		if (arg) {
			let otherFighter = client.users.find(user => user.id === arg.split('@')[1].split('>')[0])
			playerTwo = findPlayer(otherFighter)
			if (playerTwo) {
				duels.push([playerOne, playerTwo])
				msg.channel.send(`${duels[0][0].playerData} fighting ${duels[0][1].playerData}`)
			} else { msg.channel.send('Other player is not in the fight yet.') }
		} else { msg.channel.send('Need someone to fight against') }
	} else { msg.channel.send('Step into the fight first.') }
}

function sheet(msg) {
	let player: Player = findPlayer(msg.author)

	if (player) {
		let anteString = ''
		player.antes.forEach(ante => {
			anteString += `
						${ante.name}: ${ante.power}
						Availalbe: ${ante.available ? 'Yes' : 'No'}
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
						Available power: ${player.availablePower}
						Antes:
						${anteString}
						`);
		// Send the embed to the same channel as the message
		msg.channel.send(embed);
	} else {
		msg.channel.send('You are not in the fight yet.')
	}
}

function mydice(msg) {
	let player: Player = findPlayer(msg.author);
	if (player) {
		msg.channel.send(`${msg.author} your dice: ${printDice(player.play)}`)
	} else { msg.channel.send('You have not stepped into a fight yet.') }
}

client.on('message', msg => {
	if (msg.author.username != botName) {
		if (msg.content.startsWith('!emojitest')) {
			msg.channel.send(diceList.d6.map(emoji => emoji.emoji))
		}
		if (msg.content.startsWith('!help')) {
			help(msg);
		}
		if (msg.content.startsWith('!open')) {
			open(msg);
		}
		if (msg.content.startsWith('!commit')) {
			commit(msg);
		}

		if (msg.content.startsWith('!remove')) {
			remove(msg);
		}

		if (msg.content.startsWith('!sheet')) {
			sheet(msg);
		}

		if (msg.content.startsWith('!fight')) {
			fight(msg);
		}

		if (msg.content.startsWith('!counter')) {
			counter(msg);
		}

		if (msg.content.startsWith('!reroll')) {
			reroll(msg);
		}

		if (msg.content.startsWith('!mydice')) {
			mydice(msg);
		}
	}

});


client.login(auth.token);