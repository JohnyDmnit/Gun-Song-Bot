
export class Dice {
	private _type: string
	private _size: number
	private _value: number
	private _emoji: string

	constructor(emoji: string) {
		//Emoji format: <:dType_Value:Number> if emoji is present
		//Dice format: dy_x if emoji isnt present
		this._emoji = emoji
		const format: string[] = emoji.split(':')
		if (format.length != 1) {
			const emojiFormat: string[] = format[1].split('_')
			this._type = emojiFormat[0]
			this._size = parseInt(emojiFormat[0].split('d')[1])
			this._value = parseInt(emojiFormat[1])

		} else {
			const diceFormat: string[] = this._emoji.split('_')
			this._type = diceFormat[0]
			this._type = diceFormat[0].split('d')[1]
			this._value = parseInt(diceFormat[1])
		}

	}

	// public set type(v : string) {
	// 	this._type = v;
	// }

	public get type(): string {
		return this._type
	}

	// public set size(v : string) {
	// 	this._size = v;
	// }

	public get size(): number {
		return this._size
	}

	// public set value(v : number) {
	// 	this._value = v;
	// }

	public get value(): number {
		return this._value
	}

	// public set emoji(v : string) {
	// 	this._emoji = v;
	// }

	public get emoji(): string {
		return this._emoji
	}

}