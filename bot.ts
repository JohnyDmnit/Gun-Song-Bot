import * as commands from "./commands";
import { GM } from "./gm";
import { User } from "./node_modules/discord.js/src"

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

let gmList: GM[] = []

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	commands.initDice(diceList, client)
	// initGunSongGuild(guildList.gs.id)
});

client.on('message', async msg => {
	if (msg.author.username != botName) {
		const args: string[] = msg.content.split(` `)
		if (!msg.author.dmChannel) {
			await msg.author.createDM()
		}
		switch (args[0].toLowerCase()) {
			case '!create':
				commands.createGame(msg, gmList, diceList);
				break;
			case '!add':
				commands.add(msg, args, gmList);
				break;
			case '!enter': 
				commands.enter(msg, args, gmList);
				break;
			case '!commit':
				commands.commit(msg, args, gmList);
				break;
			case '!push':
				commands.push(msg, args, gmList);
				break;
			case '!remove':
				commands.remove(msg, args, gmList);
				break;
			case '!press':
				commands.press(msg, gmList);
				break;
			case '!end':
				commands.endTurn(msg, gmList);
				break;
			default:
				break;
		}
	}
});

client.login(auth.token);

