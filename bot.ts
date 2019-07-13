import { Player } from "./player";
import { Dice } from "./dice";

const Discord = require('discord.js');
const { Client, RichEmbed } = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const guildList = require('./guilds.json');


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

function open(msg) {
	let power: number = parseInt(msg.content.split(' ')[1])
	if (!!power) {
		if (players) {
			let playerExists: boolean = false
			players.forEach(player => {
				if (player.playerData.username === msg.author.username) {
					msg.channel.send(`${player.playerData} has already stepped into the fight`)
					playerExists = true
				}
			});

			if (!playerExists) {
				players.push(new Player(power, msg.author, diceList))
				msg.channel.send(`${msg.author} has stepped into the fight with ${power} dice`)
			}
		}
	} else {
		msg.channel.send(`No power entered`)
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
						let inFight: boolean = false
						players.forEach(player => {
							if (player.playerData.username === msg.author.username) {
								inFight = true
								if (player.availablePower - n >= 0) {
									player.push(n, size)
									msg.channel.send(printDice(player.play))
								} else { msg.channel.send(`Cannot over commit, you currently have ${player.availablePower} power left`) }
							}
						});
						if (!inFight) {
							msg.channel.send(`${msg.author} has not stepped into the current fight`)
						}
					} else { msg.channel.send('Cannot commit 0 or negative dice') }
				} else { msg.channel.send('Can only commit d4, d6, d8, d10') }
			} else { msg.channel.send('No ammount of dice specified') }
		} else { msg.channel.send('No type of dice specified') }
	} else { msg.channel.send('No dice comitted') }
}


function remove(msg) {
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (player.playerData.username === msg.author.username) {
			msg.channel.send(`${player.playerData} has been removed`)
			players.splice(i, 1)
		}
	}
}

function reroll(msg) {
	let splitMsg = msg.content.split(' ')
	let dice: number[] = []
	if (splitMsg[1]) {
		dice = splitMsg[1].split(',').map(die => parseInt(die))
	}

	players.forEach(player => {
		if (player.playerData.username === msg.author.username) {
			if (player.play.length >= dice.length) {
				let oldDice: Dice[] = [...player.play]
				player.reroll(dice)
				msg.channel.send(`${printDice(oldDice)} -> ${printDice(player.play)}`)
			} else { msg.channel.send('Cannot reroll more dice than you have') }
		}
	})
}

function help(msg) {
	msg.channel.send(`
	!help - print this list
	!open - step into the fight, need a power, ex: !open 2
	!commit - commit a number of dice into play, need a number of dice and type, ex !commit 2d6
	!remove - remove yourself from the fight
	!reroll - reroll an amount of dice, can be used without argument to reroll all, or specifing which dice ex: !reroll, !reroll 2,2
	`)
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

			if (counteringType) {

			} else {
				let oldDice: Dice[] = [...playerTwo.play]
				playerTwo.counter(counteredDice)
				msg.channel.send(`${playerTwo.playerData}`)
				msg.channel.send(`${printDice(oldDice)} -> ${printDice(playerTwo.play)}`)
			}
		} else { msg.channel.send('You are not in a duel') }

	} else { msg.channel.send('Improper arguments') }
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

		if (msg.content.startsWith('!fight')) {
			let participant: boolean = false
			let playerOne: Player;
			let playeTwo: Player;
			players.forEach(player => {
				if (player.playerData.username === msg.author.username) {
					participant = true
					playerOne = player
				}
			});
			if (participant) {
				let arg: string = msg.content.split(' ')[1]
				if (arg) {
					let otherFighter = client.users.find(user => user.id === arg.split('@')[1].split('>')[0])
					let otherParticipant: boolean = false
					players.forEach(player => {
						if (player.playerData.username === otherFighter.username) {
							otherParticipant = true
							playeTwo = player
						}
					});
					if (otherParticipant) {
						duels.push([playerOne, playeTwo])
						msg.channel.send(`${duels[0][0].playerData} fighting ${duels[0][1].playerData}`)
					} else {
						msg.channel.send('Other player is not in the fight yet.')
					}
				} else { msg.channel.send('Need someone to fight against') }
			} else {
				msg.channel.send('Step into the fight first.')
			}
		}

		if (msg.content.startsWith('!counter')) {
			counter(msg)
		}



		if (msg.content.startsWith('!reroll')) {
			reroll(msg);
		}

		if (msg.content.startsWith('!mydice') {
			players.forEach(player => {
				if (player.playerData.username === msg.author.username) {
					msg.channel.send(`${msg.author} your dice: ${printDice(player.play)}`)
				}
			});
		}
	}

});


client.login(auth.token);