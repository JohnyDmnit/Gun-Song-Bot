
export class Dice {
	private _type: string
	private _size: string
	private _value: number
	private _emoji: string

	constructor(emoji: string) {
		//Emoji format: <:dType_Value:Number>
		this._emoji = emoji
		let temp: string[] = this._emoji.split(':')[1].split('_')
		this._type = temp[0]
		this._size = temp[0].split('d')[1]
		this._value = parseInt(temp[1])
	}
	
	// public set type(v : string) {
	// 	this._type = v;
	// }
	
	public get type() : string {
		return this._type
	}
	
	// public set size(v : string) {
	// 	this._size = v;
	// }
	
	public get size() : string {
		return this._size
	}
	
	// public set value(v : number) {
	// 	this._value = v;
	// }
	
	public get value() : number {
		return this._value
	}
	
	// public set emoji(v : string) {
	// 	this._emoji = v;
	// }
	
	public get emoji() : string {
		return this._emoji
	}
	
}