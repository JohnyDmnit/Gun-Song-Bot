import { User } from "./node_modules/discord.js/src"
import { Character } from "./character";

export class Player extends Character {

	//Discord user data.
	private _userData: User;

	constructor(data: User, diceList: any) {
		super(data.username, diceList)
		this._userData = data
	}

	// public set playerData(v: any) {
	// 	this._playerData = v;
	// }

	public get playerData(): any {
		return this._userData
	}

	public press() {
		this._pressureTokens += 1
		this._pressure = this._play.length + this._pressureTokens
		return this._pressure
	}

}