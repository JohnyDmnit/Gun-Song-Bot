import { Player } from "./player";
import * as commands from "./commands";
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const botName: string = 'Gun Song Bot'
let diceList = {
	d4: [],
	d6: [],
	d8: [],
	d10: [],
};
let players: Player[] = [];

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	commands.initDice(diceList, client)
	// initGunSongGuild(guildList.gs.id)
});

client.on('message', async msg => {
	if (msg.author.username != botName) {
		const args: string[] = msg.content.split(` `)
		const player: Player = commands.findPlayer(msg.author, players)
		if (!msg.author.dmChannel) {
			await msg.author.createDM()
		}
		switch (args[0].toLowerCase()) {
			case '!enter':
				commands.enter(msg, args, player, players, diceList);
				break;
			case '!commit':
				commands.commit(msg, args, player);
				break;
			case '!push':
				commands.push(msg, args, player);
				break;
			case '!remove':
				commands.remove(msg, args, player);
				break;
			case '!press':
				commands.press(msg, player);
				break;
			case '!end':
				commands.endTurn(msg, player);
				break;
			case '!test':
				commands.findUserById(args, msg.channel.guild, diceList)
				break
			// case '!reroll':
			// 	commands.reroll(msg, args, player);
			// 	break;
			// case '!cut':
			// 	commands.cut(msg, player);
			// 	break;
			// case '!discard':
			// 	commands.discard(msg, args, player, diceList);
			// 	break;
			// case '!help':
			// 	commands.help(msg, args);
			// 	break;


			// case '!counter':
			// 	counter(msg, args, player, players);
			// 	break;
			// case '!leave':
			// 	leave(msg, players);
			// 	break;
			// case '!sheet':
			// 	await sheet(msg, player);
			// 	break;
			// case '!fight':
			// 	fight(msg, args, player, players, duels);
			// 	break;
			// case '!mydice':
			// 	mydice(msg, player);
			// 	break;
			// case '!ante':
			// 	ante(msg, args, player);
			// 	break;
			// case '!slayers':
			// 	slayers(msg, args, players, pregens);
			// 	break;
			// case '!setpressure':
			// 	setPressure(msg, args, player)
			// 	break;
			// case '!setpower':
			// 	setPower(msg, args, player)
			// 	break;
			// case '!adddice':
			// 	addDice(msg, args, player)
			// 	break;
			// case '!emojitest':
			// 	msg.channel.send('▫')
			// 	break;
			// case '!pmtest':
			// 	message = await msg.author.dmChannel.send(`test2`)
			// 	message.edit('test3')
			// break;
			default:
				break;
		}
	}
});

client.login(auth.token);