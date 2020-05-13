import { Dice } from "./dice";
export class Character {

	//NPC's name
	protected _name: string
	//List of dice in play.
	protected _play: Dice[];
	//List of pushed dice to reroll.
	protected _pushed: Dice[];
	protected _pressure: number;
	protected _pressureTokens: number;
	protected _dicelist;

	constructor(name: string, diceList: any) {
		this._name = name
		this._play = [];
		this._pushed = [];
		this._dicelist = diceList

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

	public set pressure(v: number) {
		this._pressure = v;
	}

	public get pressure(): number {
		return this._pressure
	}

	public set name(v : string) {
		this._name = v;
	}
	
	public get name() : string {
		return this._name
	}
	

	public set pressureTokens(v: number) {
		this._pressureTokens = v;
	}

	public get pressureTokens(): number {
		return this._pressureTokens
	}

	//Commit n dice of a certain size, default 6, for now it just pulls the dice out of thin air, will wire in power and antes later.
	public commmit(n: number, size: number = 6) {
		this._pressureTokens = 0;
		for (let i = 0; i < n; i++) {
			this._play.push(new Dice(this._dicelist[`d${size}`], size))
		}
		this._play.sort((a, b) => a.value - b.value)
		this._pressure = this._play.length + this._pressureTokens
	}

	//Push dice that are in play to pay costs
	public push(n: number[], size: number) {
		for (let i = 0; i < n.length; i++) {
			const pushValue = n[i];
			for (let j = 0; j < this._play.length; j++) {
				const dice = this._play[j];
				if (dice.size == size && dice.value == pushValue) {
					this._pushed.push(this._play.splice(j, 1)[0])
					break
				}
			}
		}
		this._pushed.sort((a, b) => a.value - b.value)
	}

	//Remove specified dice from play
	public removeDice(n: number[], size: number) {
		for (let i = 0; i < n.length; i++) {
			const removeValue = n[i];
			for (let j = 0; j < this._play.length; j++) {
				const dice = this._play[j];
				if (dice.size == size && dice.value == removeValue) {
					this._play.splice(j, 1)[0]
					break
				}
			}
		}
	}

	//End of turn cleanup
	public endTurn() {
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

}