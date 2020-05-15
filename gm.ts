import { User } from "discord.js/src"
import { Player } from "./player";
import { Character } from "./character";
import { DiceList } from "./diceList";


export class GM {

	private _userData: User;
	private _playerList: Player[]
	private _npcList: Character[]
	private _currentNPC: Character
	private _dicelist: DiceList
	// private _pairings: any[] for when targetting is added

	constructor(data: User, dicelist: DiceList) {
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

	public get currentNPC() : Character {
		return this._currentNPC
	}
	
	public set currentNPC(v : Character) {
		this._currentNPC = v;
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
		for (const player of this._playerList) {
			if (player.playerData.username === playerData.username) {
				return player
			}
		}
		return null
	}

	//Allows gm to remove any player, a player to remove themselves
	public removePlayer(user: User) {
		for (let i = 0; i < this._playerList.length; i++) {
			const player: Player = this._playerList[i];
			if (player.playerData === user) {
				this._playerList.splice(i, 1)
				break
			}
		}
	}

	public addNPC(name: string) {
		let NPC = new Character(name, this._dicelist)
		this._npcList.push(NPC)
	}

	public findNPC(name: string) {
		for (const npc of this._npcList) {
			if (npc.name.toLowerCase() === name.toLowerCase()) {
				return npc
			}
		}
		return null
	}

	public removeNPC(name: string) {
		for (let i = 0; i < this._npcList.length; i++) {
			const NPC = this._npcList[i];
			if (NPC.name.toLowerCase() === name.toLowerCase()) {
				this._npcList.splice(i, 1)
				break
			}
		}
	}

}