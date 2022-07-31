"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.pos = 1; // 1~6
        this.dice = 1; //1~6
        this.magic = 0; //0~4
        this.board = new schema_1.ArraySchema();
        this.history = new schema_1.ArraySchema();
        this.ready = false;
        this.shooting = false;
    }
}
__decorate([
    schema_1.type("number")
], Player.prototype, "pos", void 0);
__decorate([
    schema_1.type("number")
], Player.prototype, "dice", void 0);
__decorate([
    schema_1.type("number")
], Player.prototype, "magic", void 0);
__decorate([
    schema_1.type(["number"])
], Player.prototype, "board", void 0);
__decorate([
    schema_1.type(["number"])
], Player.prototype, "history", void 0);
__decorate([
    schema_1.type("boolean")
], Player.prototype, "ready", void 0);
__decorate([
    schema_1.type("boolean")
], Player.prototype, "shooting", void 0);
exports.Player = Player;
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type({ map: Player })
], GameState.prototype, "players", void 0);
exports.GameState = GameState;
