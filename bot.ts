import { Player } from "./player";

const Discord = require('discord.js');
const { Client, RichEmbed } = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const botName: string = 'Gun Song Bot'

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

let players: any[] = [];

function dice(n) {
	return Math.ceil(Math.random() * n)
}



client.on('message', msg => {
	if (msg.author.username != botName) {

		if (msg.content.startsWith('!step')) {
			let power = parseInt(msg.content.split(' ')[1])
			players.push(new Player(power, msg.author))
			msg.channel.send
		}

		if (msg.content.startsWith('!commit')) {
			let dice = msg.content.split(' ')[1]
			if (dice) {
				players.forEach(player => {
					if(player.playerData.username === msg.author.username) {
						const n: number = dice.split('d')[0]
						const size: number = dice.split('d')[1]
						player.push(n, size)
						msg.channel.send(`${msg.author}`)
						msg.channel.send(player.play)
					}
				});
			}
		}
	}

});



client.login(auth.token);