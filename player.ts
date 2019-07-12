import { Dice } from "./dice";

export class Player {
	playerData: any;
	play: Dice[];
	power: number;
	availablePower: number;
	diceList: any;

	constructor(_power: number, data: any, _diceList: any) {
		this.power = _power
		this.playerData = data
		this.play = [];
		this.availablePower = _power
		this.diceList = _diceList
	}

	push(n: number, size: number) {
		if(n && size) {
			if (this.availablePower && this.availablePower - n >= 0) {
				this.availablePower -= n;
				for (let i = 0; i < n; i++) {
					let roll = this.dice(size)
					this.play.push(this.diceList[`d${size}`][roll-1])
				}
			}
			this.play.sort((a, b) => a - b)
		}
	}

	counter(x: number, y?: number, xType?: number, yType?: number) {

	}

	private dice(n) {
		return Math.ceil(Math.random() * n)
	}
	
}