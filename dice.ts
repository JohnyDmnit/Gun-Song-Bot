import { DiceEmoji } from "./diceEmoji";

export class Dice {
	
	//Type of the dice as a number d6 = 6, d10 = 10 and so on
	private _size: number
	//What the dice rolled
	private _value: number
	//Current emoji used when displaying dice
	private _emoji: string
	//Emoji list for the dice type
	private _emojiList: DiceEmoji[]

	constructor(emojiList: DiceEmoji[], size: number) {
		//Emoji format: <:dType_Value:Number> if emoji is present
		//Dice format: dy_x if emoji isnt present
		this._emojiList = emojiList
		this._size = size
		// this._type = `d${size}`
		this._value = this.roll()
		this._emoji = this._emojiList[this._value - 1].emoji

	}

	public get type(): string {
		return `d${this._size}`
	}

	public get size(): number {
		return this._size
	}

	public set size(v : number) {
		this._size = v;
	}

	public set value(v: number) {
		this._value = v;
		this._emoji = this._emojiList[v - 1].emoji
	}

	public get value(): number {
		return this._value
	}

	public get emoji(): string {
		return this._emoji
	}

	public roll(): number {
		console.log(this._value)
		let newRoll: number = Math.ceil(Math.random() * this._size)
		this._value = newRoll
		this._emoji = this._emojiList[newRoll - 1].emoji
		console.log(this._value)
		return this._value
	}
}