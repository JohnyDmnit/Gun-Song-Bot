export class Ante {
	_name: string;
	_power: number;
	_available: boolean;
	_text: string;

	constructor(name, power, text) {
		this._name = name
		this._available = true
		this._power = power
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