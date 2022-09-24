import {Schema, MapSchema, ArraySchema, type} from "@colyseus/schema";
import {GameRoom} from "../GameRoom";

export class Player extends Schema {
    @type("number") pos: number = 1; // 1~6
    @type("number") dice: number = 1; //1~6
    @type("number") magic: number = 0; //0~4
    // @type("number") delay: number = 0;
    @type(["number"]) board: ArraySchema<number> = new ArraySchema<number>();
    @type(["number"]) history: ArraySchema<number> = new ArraySchema<number>();
    @type("boolean") ready:boolean = false;
    @type("boolean") shooting:boolean = false;
}

export class GameState extends Schema {
    @type({map: Player}) players: MapSchema<Player> = new MapSchema<Player>();
}