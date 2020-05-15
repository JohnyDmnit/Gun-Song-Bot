import * as commands from "./commands";
import { GM } from "./gm";
import { DiceList } from "./diceList";

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const botName: string = 'Gun Song Bot'

let diceList: DiceList
let gmList: GM[] = []

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	diceList = new DiceList(client)
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
			case '!setnpc':
				commands.setNPC(msg, args, gmList);
				break;
				case '!listnpc':
				commands.listNPC(msg, gmList);
				break;
			case '!addnpc':
				commands.addNPC(msg, args, gmList);
				break;
			case '!enter':
				commands.enter(msg, args, gmList);
				break;
			case '!commit':
				commands.commit(msg, args, gmList);
				break;
			case '!npccommit':
				commands.npcCommit(msg, args, gmList);
				break;
			case '!push':
				commands.push(msg, args, gmList);
				break;
			case '!npcpush':
				commands.npcPush(msg, args, gmList);
				break;
			case '!remove':
				commands.remove(msg, args, gmList);
				break;
			case '!npcremove':
				commands.npcRemove(msg, args, gmList);
				break;
			case '!press':
				commands.press(msg, gmList);
				break;
			case '!npcpress':
				commands.npcPress(msg, gmList);
				break;
			case '!end':
				commands.endTurn(msg, gmList);
				break;
			case '!npcend':
				commands.endNPCTurn(msg, gmList);
				break;
			case '!guard':
				commands.guard(msg, args, gmList);
				break;
			case '!npcguard':
				commands.npcGuard(msg, args, gmList);
				break;
			case '!setplaydice':
				commands.setPlayDice(msg, args, gmList);
				break;
			case '!setnpcplaydice':
				commands.setNPCPlayDice(msg, args, gmList);
				break;
			case '!setpusheddice':
				commands.setPushedDice(msg, args, gmList);
				break;
			case '!setnpcpusheddice':
				commands.setNPCPushedDice(msg, args, gmList);
				break;
			case '!test':
				commands.test(msg, gmList);
				break;
			default:
				break;
		}
	}
});

client.login(auth.token);

