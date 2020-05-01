import { Dice } from "./dice";
// import { Ante } from "./ante";
import { User, Message } from "./node_modules/discord.js/src"

export class Player {

	//Discord user data.
	private _playerData: User;
	//List of dice in play.
	private _play: Dice[];
	//List of pushed dice to reroll.
	private _pushed: Dice[];
	//Power pool dice type.
	// private _power: number;
	//Power pool dice number.
	// private _powerSize: number;
	//How much power the player has left.
	// private _availablePower: number;
	private _discard: number;
	private _pressure: number;
	private _pressureTokens: number;
	private _dicelist;

	constructor(data: User, diceList: any) {
		this._pressure = 0;
		this._pressureTokens = 0;
		this._playerData = data;
		this._play = [];
		this._pushed = [];
		this._discard = 0
		this._dicelist = diceList
		// this._power = parseInt(power.split('d')[0]);
		// this._powerSize = parseInt(power.split('d')[1])
		// this._availablePower = parseInt(power.split('d')[0]);

	}

	public set playerData(v: any) {
		this._playerData = v;
	}

	public get playerData(): any {
		return this._playerData
	}

	public set play(v: Dice[]) {
		this._play = v;
	}

	public get play(): Dice[] {
		return this._play
	}

	public set pushed(v: Dice[]) {
		this._pushed = v;
	}

	public get pushed(): Dice[] {
		return this._pushed
	}

	public set discard(v: number) {
		this._discard = v;
	}

	public get discard(): number {
		return this._discard
	}

	public set pressure(v: number) {
		this._pressure = v;
	}

	public get pressure(): number {
		return this._pressure
	}

	public set pressureTokens(v: number) {
		this._pressureTokens = v;
	}

	public get pressureTokens(): number {
		return this._pressureTokens
	}

	// public set power(v : number) {
	// 	this._power = v;
	// }

	// public get power(): number {
	// 	return this._power
	// }

	// public set powerSize(v : number) {
	// 	this._powerSize = v;
	// }

	// public get powerSize(): number {
	// 	return this._powerSize
	// }

	// public set availablePower(v: number) {
	// 	this._availablePower = v;
	// }

	// public get availablePower(): number {
	// 	return this._availablePower
	// }

	//Commit n dice of a certain size, default 6, for now it just pulls the dice out of thin air, will wire in power and antes later.
	commmit(n: number, size: number = 6) {
		this._pressureTokens = 0;
		for (let i = 0; i < n; i++) {
			this._play.push(new Dice(this._dicelist[`d${size}`], size))
		}
		this._play.sort((a, b) => a.value - b.value)
		this._pressure = this._play.length + this._pressureTokens
	}

	//Push dice that are in play to pay costs
	push(n: number[], size: number) {
		for (let i = 0; i < n.length; i++) {
			const pushValue = n[i];
			for (let j = 0; j < this._play.length; j++) {
				const dice = this._play[j];
				if(dice.size == size && dice.value == pushValue) {
					this._pushed.push(this._play.splice(j,1)[0])
					break
				}
			}
		}
		this._pushed.sort((a, b) => a.value - b.value)
	}

	//Remove specified dice from play
	removeDice(n: number[], size: number) {
		for (let i = 0; i < n.length; i++) {
			const removeValue = n[i];
			for (let j = 0; j < this._play.length; j++) {
				const dice = this._play[j];
				if(dice.size == size && dice.value == removeValue) {
					this._play.splice(j,1)[0]
					break
				}
			}
		}
	}

	press() {
		this._pressureTokens += 1
		this._pressure = this._play.length + this._pressureTokens
		return this._pressure
	}

	//End of turn cleanup
	endTurn() {
		if (this._pushed.length > 0) {
			for (let i = 0; i < this._pushed.length; i++) {
				this._pushed[i].reroll()
				this._play.push(this._pushed[i])
				
			}
			this._play.sort((a, b) => a.value - b.value)
			this._pushed = []
		} else {
			this._pressureTokens = 0
			this._pressure = this._play.length + this._pressureTokens
		}
		
	}

	// rollDice(n: number, size: number = 6) {
	// 	for (let i = 0; i < n; i++) {
	// 		let roll = this.dice(size) - 1
	// 		this._play.push(this._diceList[`d${size}`][roll])
	// 	}
	// 	this._play.sort((a, b) => a.value - b.value)
	// }

	// addDice(diceArr: number[], size: number = 6) {
	// 	for (let i = 0; i < diceArr.length; i++) {
	// 		const value = diceArr[i] - 1;
	// 		this._play.push(this._diceList[`d${size}`][value])
	// 	}
	// 	this._play.sort((a, b) => a.value - b.value)
	// 	this._pressure = this._play.length + this._pressureTokens
	// }

	// ante(name: string) {
	// 	this._pressureTokens = 0
	// 	let anteExists: boolean = false
	// 	let foundAnte: Ante;
	// 	for (let i = 0; i < this._antes.length; i++) {
	// 		const ante = this._antes[i];
	// 		if (ante.name.toUpperCase().startsWith(name.toUpperCase()) && ante.available) {
	// 			anteExists = true
	// 			foundAnte = ante
	// 			ante.available = false
	// 			this.rollDice(ante.power, ante.size)
	// 			break
	// 		}
	// 	}

	// 	this._pressure = this._play.length + this._pressureTokens
	// 	if (anteExists) {
	// 		return foundAnte
	// 	} else {
	// 		return null
	// 	}
	// }

	//Keep all dice removals in here
	// counter(dice: number[], size: number = 0) {
	// 	for (let i = 0; i < dice.length; i++) {
	// 		const die = dice[i];
	// 		for (let j = 0; j < this._play.length; j++) {
	// 			const playerDie: Dice = this._play[j];
	// 			if (die === playerDie.value) {
	// 				if (size != 0) {
	// 					if (playerDie.size === size) {
	// 						this._play.splice(j, 1)
	// 						this._discard++
	// 						break
	// 					}
	// 				} else {
	// 					this._play.splice(j, 1)
	// 					this._discard++
	// 					break
	// 				}
	// 			}
	// 		}
	// 	}
	// 	this._pressure = this._play.length + this._pressureTokens
	// }

	// cut(recover: boolean) {
	// 	if (recover) {
	// 		this._discard -= this._clock;
	// 		this._availablePower++;
	// 	}
	// 	this._clock++;
	// }

	// reroll(dice: number[], size: number = 0) {
	// 	let newDice: Dice[] = []
	// 	let newPlay: Dice[] = [...this._play]

	// 	if (dice.length > 0) {
	// 		for (let i = 0; i < dice.length; i++) {
	// 			const die = dice[i];
	// 			for (let j = 0; j < this._play.length; j++) {
	// 				const playerDie = this._play[j];
	// 				if (playerDie.value === die) {
	// 					if (size != 0) {
	// 						if (playerDie.size === size) {
	// 							let roll = this.dice(playerDie.size)
	// 							newPlay.splice(j, 1)
	// 							newPlay.push(this._diceList[playerDie.type][roll - 1])
	// 							break
	// 						}
	// 					} else {
	// 						let roll = this.dice(playerDie.size)
	// 						newPlay.splice(j, 1)
	// 						newPlay.push(this._diceList[playerDie.type][roll - 1])
	// 						break
	// 					}
	// 				}
	// 			}
	// 		}
	// 	} else {
	// 		//Reroll all dice
	// 		let j = 0
	// 		while (newPlay.length > 0) {
	// 			const playerDie = this._play[j];
	// 			let roll = this.dice(playerDie.size)
	// 			newPlay.splice(0, 1)
	// 			newDice.push(this._diceList[playerDie.type][roll - 1])
	// 			j++
	// 		}
	// 	}
	// 	newPlay.push(...newDice)
	// 	this._play = [...newPlay]
	// 	this._play.sort((a, b) => a.value - b.value)
	// }

}