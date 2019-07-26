import { Player } from "./player";
import { initDice, findPlayer, help, enter, commit, leave, sheet, fight, counter, reroll, mydice, press, ante, slayers, cut, discard, setPressure, setPower, addDice } from "./commands";
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const pregens = require('./pregens.json');

const botName: string = 'Gun Song Bot'
let diceList = {
	d4: [],
	d6: [],
	d8: [],
	d10: [],
};
let players: Player[] = [];
let duels: string[] = [];

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	initDice(diceList, client)
	// initGunSongGuild(guildList.gs.id)
});

client.on('message', msg => {
	if (msg.author.username != botName) {
		const args: string[] = msg.content.split(' ')
		const player: Player = findPlayer(msg.author, players)
		switch (args[0]) {
			case '!emojitest':
				msg.channel.send('▫')
				break;
			case '!help':
				help(msg, args);
				break;
			case '!enter':
				enter(msg, player, players, pregens, diceList);
				break;
			case '!commit':
				commit(msg, args, player);
				break;
			case '!leave':
				leave(msg, players);
				break;
			case '!sheet':
				sheet(msg, player);
				break;
			case '!fight':
				fight(msg, args, player, players, duels);
				break;
			case '!counter':
				counter(msg, args, player, players);
				break;
			case '!reroll':
				reroll(msg, args, player);
				break;
			case '!mydice':
				mydice(msg, player);
				break;
			case '!press':
				press(msg, player);
				break;
			case '!ante':
				ante(msg, args, player);
				break;
			case '!slayers':
				slayers(msg, args, players, pregens);
				break;
			case '!cut':
				cut(msg, player);
				break;
			case '!discard':
				discard(msg, args, player, diceList);
				break;
			case '!setPressure':
				setPressure(msg, args, player)
				break;
			case '!setPower':
				setPower(msg, args, player)
				break;
			case '!addDice':
				addDice(msg, args, player)
				break;
			default:
				break;
		}
	}
});

client.login(auth.token);