import { Player } from "./player";
import { Dice } from "./dice";

const Discord = require('discord.js');
const { Client, RichEmbed } = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const botName: string = 'Gun Song Bot'
let diceList = {
	d4: [],
	d6: [],
	d8: [],
	d10: [],
};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	initDice(diceList)
});

let players: any[] = [];
let duel: any[] = [];

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



client.on('message', msg => {
	if (msg.author.username != botName) {
		if (msg.content.startsWith('!emojitest')) {
			msg.channel.send(diceList.d6.map(emoji => emoji.emoji))
		}
		if (msg.content.startsWith('!step')) {
			let power = parseInt(msg.content.split(' ')[1])
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

		if (msg.content.startsWith('!remove')) {
			for (let i = 0; i < players.length; i++) {
				const player = players[i];
				if (player.playerData.username === msg.author.username) {
					msg.channel.send(`${player.playerData} has been removed`)
					players.splice(i, 1)
				}
			}
		}

		if (msg.content.startsWith('!commit')) {
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
											let diceString: string = ''
											player.play.forEach(dice => {
												diceString += `${dice.emoji} `
											});
											if (diceString) {
												msg.channel.send(diceString)
											}
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

		if (msg.content.startsWith('!reroll')) {
			players.forEach(player => {
				if (player.playerData.username === msg.author.username) {
					let dice = msg.content.split(' ')[1].split(',').map(die => parseInt(die))
					player.reroll(dice)
					let diceString: string = ''
					player.play.forEach(dice => {
						diceString += `${dice.emoji} `
					});
					msg.channel.send(diceString)

				}
			}
		}
	}

});



client.login(auth.token);