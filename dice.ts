
export class Dice {
	type: string
	size: string
	value: number
	emoji: string

	constructor(_emoji: string) {
		//Emoji format: <:dType_Value:Number>
		this.emoji = _emoji
		let temp: string[] = this.emoji.split(':')[1].split('_')
		this.type = temp[0]
		this.size = temp[0].split('d')[1]
		this.value = parseInt(temp[1])
	}
}