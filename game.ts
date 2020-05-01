import { Player } from "./player";
import { NPC } from "./npc";

export class Game {

	private _playerList : Player[]
	private _npcList : NPC[]
	private _GM: Player //Maybe create a GM class that extends player
	private _currentNPC: NPC[]
	private _pairings: any[] //Create a pairing class
	

	constructor(player: Player) {
		this._GM = player
	}

	// public set value(v: number) {
	// 	this._value = v;
	// }

	public get playerList(): Player[] {
		return this._playerList
	}

	public get npcList(): NPC[] {
		return this._npcList
	}

	public get GM(): Player {
		return this._GM
	}

	//Gm can add players
	public addPlayer(player: Player) {
		this._playerList.push(player)		
	}

	//Allows gm to remove any player, a player to remove themselves
	public removePlayer() {
		
	}

	public addNPC() {
		
	}

	public removeNPC() {
		
	}

}