export class Ante {
	private _name: string;
	private _power: number;
	private _size: number;
	private _available: boolean;
	private _text: string;

	constructor(name, power, text) {
		this._name = name
		this._available = true
		this._power = parseInt(power.split('d')[0])
		this._size = parseInt(power.split('d')[1])
		this._text = text
	}
	
	// public set name(v : string) {
	// 	this._name = v;
	// }
	
	public get name() : string {
		return this._name
	}
	
	public set power(v : number) {
		this._power = v;
	}
	
	public get power() : number {
		return this._power
	}

	public set size(v : number) {
		this._size = v;
	}
	
	public get size() : number {
		return this._size
	}
	
	public set available(v : boolean) {
		this._available = v;
	}
	
	public get available() : boolean {
		return this._available
	}
	
	// public set text(v : string) {
	// 	this._text = v;
	// }
	
	public get text() : string {
		return this._text
	}
	
	
}