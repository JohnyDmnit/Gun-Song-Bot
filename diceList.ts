import { Client } from "discord.js/src"
import { DiceEmoji } from "./diceEmoji";

export class DiceList {

	//The list of dice
	private _d4: DiceEmoji[]
	private _d6: DiceEmoji[]
	private _d8: DiceEmoji[]
	private _d10: DiceEmoji[]

	constructor(client: Client) {
		this._d4 = this.initdice(`d4`, client)
		this._d6 = this.initdice(`d6`, client)
		this._d8 = this.initdice(`d8`, client)
		this._d10 = this.initdice(`d10`, client)

	}

	public get d4() : DiceEmoji[] {
		return this._d4
	}

	public get d6() : DiceEmoji[] {
		return this._d6
	}

	public get d8() : DiceEmoji[] {
		return this._d8
	}

	public get d10() : DiceEmoji[] {
		return this._d10
	}
	

	//Initialize a dice type from the emojis available to the bot
	private initdice(diceType: string, client: Client): DiceEmoji[] {
		let diceArray: DiceEmoji[] = []
		client.emojis.cache.forEach(emoji => {
			if (
				emoji.name.startsWith(diceType)
			) {
				let emojiString = emoji.toString()
				let format: string[] = emojiString.split(':')
				let value: number = 0
				if (format.length != 1) {
					let emojiFormat: string[] = format[1].split('_')
					value = parseInt(emojiFormat[1])
				}
				diceArray.push(new DiceEmoji(value, emojiString))
				//Sorting so the emoji is position in the array is equivalent to its value
				diceArray.sort((a, b) => a.value - b.value)
			}
		})
		return diceArray
	}

}