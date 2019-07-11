"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(_power, data) {
        this.power = _power;
        this.playerData = data;
        this.play = [];
        this.availablePower = _power;
    }
    push(n, size) {
        if (n && size) {
            if (this.availablePower && this.availablePower - n >= 0) {
                this.availablePower -= n;
                for (let i = 0; i < n; i++) {
                    this.play.push(this.dice(size));
                }
            }
            this.play.sort((a, b) => a - b);
        }
    }
    dice(n) {
        return Math.ceil(Math.random() * n);
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map