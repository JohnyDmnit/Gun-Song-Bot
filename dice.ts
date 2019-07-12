
export class Dice {
	type: string
	value: number
	emoji: string

	constructor(_value: number, _emoji: string, _type) {
		this.type = _type
		this.value  = _value
		this.emoji = _emoji
	}
}