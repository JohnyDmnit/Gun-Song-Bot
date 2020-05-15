export class DiceEmoji {

	private _value: number 
	private _emoji: string

	constructor(value: number, emoji: string) {
		this._value = value
		this._emoji = emoji
	}

	public get value() : number {
		return this._value
	}

	public get emoji() : string {
		return this._emoji
	}

}