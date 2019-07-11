export class Player {
	playerData: any;
	play: number[];
	power: number;
	availablePower: number;

	constructor(_power: number, data: any) {
		this.power = _power
		this.playerData = data
		this.play = [];
		this.availablePower = _power
	}

	push(n: number, size: number) {
		if(n && size) {
			if (this.availablePower && this.availablePower - n >= 0) {
				this.availablePower -= n;
				for (let i = 0; i < n; i++) {
					this.play.push(this.dice(size))				
				}
			}
			this.play.sort((a, b) => a - b)
		}
	}

	private dice(n) {
		return Math.ceil(Math.random() * n)
	}
	
}