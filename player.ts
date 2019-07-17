import { Dice } from "./dice";
import { Ante } from "./ante";

export class Player {
	playerData: any;
	play: Dice[];
	power: number;
	availablePower: number;
	diceList: any;
	antes: Ante[];
	classType: string;
	discard: number;
	clock: number;
	pressure: number;
	pressureTokens: number;

	constructor(power: number, data: any, diceList: any, antes: Ante[], classType: string) {
		this.pressure = 0;
		this.pressureTokens = 0;
		this.power = power;
		this.playerData = data;
		this.play = [];
		this.availablePower = power;
		this.diceList = diceList;
		this.antes = antes.map(ante => new Ante(ante.name, ante.power, ante.text))
		this.classType = classType;
		this.discard = 0
		this.clock = 2

	}

	push(n: number, size: number = 6) {
		this.availablePower -= n;
		this.pressureTokens = 0;
		for (let i = 0; i < n; i++) {
			let roll = this.dice(size)
			this.play.push(this.diceList[`d${size}`][roll - 1])
		}
		this.play.sort((a, b) => a.value - b.value)
		this.pressure = this.play.length + this.pressureTokens
	}

	press() {
		this.pressureTokens += 1
		this.pressure = this.play.length + this.pressureTokens
		return this.pressure
	}

	ante(name: string) {
		this.pressureTokens = 0
		let anteExists: boolean = false
		let foundAnte: Ante;
		for (let i = 0; i < this.antes.length; i++) {
			const ante = this.antes[i];
			if (ante.name.toUpperCase().startsWith(name.toUpperCase()) && ante.available) {
				anteExists = true
				foundAnte = ante
				ante.available = false
				this.availablePower += ante.power
				this.push(ante.power)
				break
			}
		}

		this.pressure = this.play.length + this.pressureTokens
		if (anteExists) {
			return foundAnte
		} else {
			return null
		}
	}

	//Keep all dice removals in here
	counter(dice: number[], xType?: number) {
		for (let i = 0; i < dice.length; i++) {
			const die = dice[i];
			for (let j = 0; j < this.play.length; j++) {
				const playerDie = this.play[j];
				if (die === playerDie.value) {
					if (xType) {

					} else {
						this.play.splice(j, 1)
						this.discard++
						break
					}
				}
			}
		}
	}

	cut(recover: boolean) {
		if (recover) {
			this.discard -= this.clock;
			this.availablePower++;
		}
		this.clock++;
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