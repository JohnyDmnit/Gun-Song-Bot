import { User } from "./node_modules/discord.js/src"
import { Character } from "./character";

export class Player extends Character {

	//Discord user data.
	private _userData: User;

	constructor(data: User, diceList: any) {
		super(data.username, diceList)
		this._userData = data
	}

	public get playerData(): any {
		return this._userData
	}

}