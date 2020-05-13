import { Player } from "./player";
import { Character } from "./character";
import { User } from "discord.js/src"


export class GM {

	private _userData: User;
	private _playerList: Player[]
	private _npcList: Character[]
	private _currentNPC: Character
	private _dicelist
	// private _pairings: any[] for when targetting is added


	constructor(data: User, dicelist) {
		this._userData = data
		this._dicelist = dicelist
		this._playerList = []
		this._npcList = []
	}

	public get playerList(): Player[] {
		return this._playerList
	}

	public get npcList(): Character[] {
		return this._npcList
	}

	public get userData(): User {
		return this._userData
	}
	//Gm can add players
	public addPlayer(user: User) {
		let player = new Player(user, this._dicelist)
		this._playerList.push(player)
	}

	public findPlayer(playerData: User) {
		for (let i = 0; i < this._playerList.length; i++) {
			const player = this._playerList[i];
			if (player.playerData.username === playerData.username) {
				return player
			}
		}
		return null
	}

	//Allows gm to remove any player, a player to remove themselves
	public removePlayer() {

	}

	public addNPC() {

	}

	public removeNPC() {

	}

	public setNpc() {

	}

}