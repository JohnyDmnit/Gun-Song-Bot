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

	counter(dice: number[], xType?: number) {
		for (let i = 0; i < dice.length; i++) {
			const die = dice[i];
			for (let j = 0; j < this.play.length; j++) {
				const playerDie = this.play[j];
				if (die === playerDie.value) {
					if(xType) {
						
					} else {
						this.play.splice(j,1)
						break
					}
				}
				
			}
			
		}
	}

	reroll(dice: number[], type?: string) {
		let length = this.play.length
		let newDice: Dice[] = []
		let newPlay: Dice[] = [...this.play]

		if (dice.length > 0) {
			for (let i = 0; i < dice.length; i++) {
				const die = dice[i];
				for (let j = 0; j < this.play.length; j++) {
					const playerDie = this.play[j];
					if (playerDie.value === die) {
						if (type) {
							
						} else {
							let roll = this.dice(playerDie.size)
						newPlay.splice(j, 1)
						newPlay.push(this.diceList[playerDie.type][roll - 1])
						break
						}
					}
				}
			}
		} else {
			//Reroll all dice
			let j = 0
			while (newPlay.length > 0) {
				const playerDie = this.play[j];
				let roll = this.dice(playerDie.size)
				newPlay.splice(0, 1)
				newDice.push(this.diceList[playerDie.type][roll - 1])
				j++
			}
		}

		newPlay.push(...newDice)
		this.play = [...newPlay]
		this.play.sort((a, b) => a.value - b.value)
	}

	private dice(n) {
		return Math.ceil(Math.random() * n)
	}

}