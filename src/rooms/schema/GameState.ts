import {Schema, MapSchema, ArraySchema, type} from "@colyseus/schema";
import {GameRoom} from "../GameRoom";

export class Player extends Schema {
    @type("number") pos: number = 1; // 1~6
    @type("number") dice: number = 1; //1~6
    @type(["number"]) board: number[] = new ArraySchema<number>();
    @type(["number"]) history: number[] = new ArraySchema<number>();

    constructor() {
        super();
        for (let i = 0; i < GameRoom.INIT_LINES * GameRoom.BOARD_WIDTH; i++) {
            this.board.push(Math.ceil(Math.random()*GameRoom.DICE_NUM));
        }
    }
}

export class GameState extends Schema {
    @type({map: Player}) players = new MapSchema<Player>();
}