import { Dice } from "./dice";
import { Ante } from "./ante";

export class Player {

	private _playerData: any;
	private _play: Dice[];
	private _power: number;
	private _availablePower: number;
	private _diceList: any;
	private _antes: Ante[];
	private _classType: string;
	private _discard: number;
	private _clock: number;
	private _pressure: number;
	private _pressureTokens: number;
	private _duel: string;

	constructor(power: number, data: any, diceList: any, antes: Ante[], classType: string) {
		this._pressure = 0;
		this._pressureTokens = 0;
		this._power = power;
		this._playerData = data;
		this._play = [];
		this._availablePower = power;
		this._diceList = diceList;
		this._antes = antes.map(ante => new Ante(ante.name, ante.power, ante.text))
		this._classType = classType;
		this._discard = 0
		this._clock = 2
		this._duel = ''

	}

	public set playerData(v : any) {
		this._playerData = v;
	}

	public get playerData() : any {
		return this._playerData
	}
	
	public set play(v : Dice[]) {
		this._play = v;
	}
	
	public get play() : Dice[] {
		return this._play
	}
	
	// public set power(v : number) {
	// 	this._power = v;
	// }
	
	public get power() : number {
		return this._power
	}
	
	public set availablePower(v : number) {
		this._availablePower = v;
	}
	
	public get availablePower() : number {
		return this._availablePower
	}
		
	public set antes(v : Ante[]) {
		this._antes = v;
	}
	
	public get antes() : Ante[] {
		return this._antes
	}
	
	public set classType(v : string) {
		this._classType = v;
	}
	
	public get classType() : string {
		return this._classType
	}
	
	public set discard(v : number) {
		this._discard = v;
	}
	
	public get discard() : number {
		return this._discard
	}

	public set clock(v : number) {
		this._clock = v;
	}
	
	public get clock() : number {
		return this._clock
	}
	
	public set pressure(v : number) {
		this._pressure = v;
	}
	
	public get pressure() : number {
		return this._pressure
	}
	
	public set pressureTokens(v : number) {
		this._pressureTokens = v;
	}
	
	public get pressureTokens() : number {
		return this._pressureTokens
	}
	
	public set duel(v : string) {
		this._duel = v;
	}
	
	public get duel() : string {
		return this._duel
	}
	
	addDice(n: number, size: number = 6){
		for (let i = 0; i < n; i++) {
			let roll = this.dice(size)
			this._play.push(this._diceList[`d${size}`][roll - 1])
		}
		this._play.sort((a, b) => a.value - b.value)
	}

	push(n: number, size: number = 6) {
		this._availablePower -= n;
		this._pressureTokens = 0;
		this.addDice(n, size)
		this._pressure = this._play.length + this._pressureTokens
	}

	press() {
		this._pressureTokens += 1
		this._pressure = this._play.length + this._pressureTokens
		return this._pressure
	}

	ante(name: string) {
		this._pressureTokens = 0
		let anteExists: boolean = false
		let foundAnte: Ante;
		for (let i = 0; i < this._antes.length; i++) {
			const ante = this._antes[i];
			if (ante.name.toUpperCase().startsWith(name.toUpperCase()) && ante.available) {
				anteExists = true
				foundAnte = ante
				ante.available = false
				this.addDice(ante.power)
				break
			}
		}

		this._pressure = this._play.length + this._pressureTokens
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
			for (let j = 0; j < this._play.length; j++) {
				const playerDie = this._play[j];
				if (die === playerDie.value) {
					if (xType) {

					} else {
						this._play.splice(j, 1)
						this._discard++
						break
					}
				}
			}
		}
		this._pressure = this._play.length + this._pressureTokens
	}

	cut(recover: boolean) {
		if (recover) {
			this._discard -= this._clock;
			this._availablePower++;
		}
		this._clock++;
	}

	reroll(dice: number[], type?: string) {
		let length = this._play.length
		let newDice: Dice[] = []
		let newPlay: Dice[] = [...this._play]

		if (dice.length > 0) {
			for (let i = 0; i < dice.length; i++) {
				const die = dice[i];
				for (let j = 0; j < this._play.length; j++) {
					const playerDie = this._play[j];
					if (playerDie.value === die) {
						if (type) {

						} else {
							let roll = this.dice(playerDie.size)
							newPlay.splice(j, 1)
							newPlay.push(this._diceList[playerDie.type][roll - 1])
							break
						}
					}
				}
			}
		} else {
			//Reroll all dice
			let j = 0
			while (newPlay.length > 0) {
				const playerDie = this._play[j];
				let roll = this.dice(playerDie.size)
				newPlay.splice(0, 1)
				newDice.push(this._diceList[playerDie.type][roll - 1])
				j++
			}
		}

		newPlay.push(...newDice)
		this._play = [...newPlay]
		this._play.sort((a, b) => a.value - b.value)
	}

	private dice(n) {
		return Math.ceil(Math.random() * n)
	}

}