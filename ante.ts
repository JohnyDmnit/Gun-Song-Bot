export class Ante {
	name: string;
	power: number;
	available: boolean;
	text: string;

	constructor(name, power, text) {
		this.name = name
		this.available = true
		this.power = power
		this.text = text
	}
}