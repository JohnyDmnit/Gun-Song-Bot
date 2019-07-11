"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = require("./player");
const Discord = require('discord.js');
const { Client, RichEmbed } = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const botName = 'Gun Song Bot';
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
let players = [];
function dice(n) {
    return Math.ceil(Math.random() * n);
}
client.on('message', msg => {
    if (msg.author.username != botName) {
        if (msg.content.startsWith('!step')) {
            let power = parseInt(msg.content.split(' ')[1]);
            players.push(new player_1.Player(power, msg.author));
        }
        if (msg.content.startsWith('!push')) {
            let dice = msg.content.split(' ')[1];
            if (dice) {
                players.forEach(player => {
                    if (player.playerData.username === msg.author.username) {
                        const n = dice.split('d')[0];
                        const size = dice.split('d')[1];
                        player.push(n, size);
                        msg.channel.send(`${msg.author} ${player.play}`);
                    }
                });
            }
        }
    }
});
client.login(auth.token);
//# sourceMappingURL=bot.js.map