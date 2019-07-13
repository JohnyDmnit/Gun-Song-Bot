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
		this.availablePower -= n;
		for (let i = 0; i < n; i++) {
			let roll = this.dice(size)
			this.play.push(this.diceList[`d${size}`][roll - 1])
		}
		this.play.sort((a, b) => a.value - b.value)
	}

	counter(x: number, xType?: number) {

	}

	reroll(dice: number[], type?: string) {
		for (let i = 0; i < dice.length; i++) {
			const die = dice[i];
			for (let j = 0; j < this.play.length; j++) {
				let playerDie = this.play[j];
				if (type) {
					//Implement by type
				} else {
					if (playerDie.value === die) {
						let roll = this.dice(playerDie.size)
						this.play.splice(j, 1)
						this.play.push(this.diceList[playerDie.type][roll - 1])
						this.play.sort((a, b) => a.value - b.value)
						break
					}
				}
			}
		}
	}

	private dice(n) {
		return Math.ceil(Math.random() * n)
	}

}