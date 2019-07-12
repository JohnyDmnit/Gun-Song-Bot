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
	client.emojis
		.forEach(emoji => {
			if (
				emoji.name.startsWith('d4') ||
				emoji.name.startsWith('d6') ||
				emoji.name.startsWith('d8') ||
				emoji.name.startsWith('d10')
			) {
				//Emoji format: <:dType_Value:Number>
				let splitEmoji: string[] = emoji.name.split('_')
				let value: number = parseInt(splitEmoji[1])
				let type: string = splitEmoji[0]
				diceList[type].push(new Dice(value, emoji.toString(), type))
				diceList[type].sort((a, b) => a.value - b.value)
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
				players.forEach(player => {
					if (player.playerData.username === msg.author.username) {
						const n: number = dice.split('d')[0]
						const size: number = dice.split('d')[1]
						player.push(n, size)
						msg.channel.send(`${msg.author}`)
						let diceString: string = ''
						player.play.forEach(dice => {
							diceString += `${dice.emoji} `
						});
						if (diceString) {
							msg.channel.send(diceString)
						} else {
							msg.channel.send('Not enough dice probably, catch this properly :3')
						}
					}
				});
			}
		}
	}

});



client.login(auth.token);