import {Schema, MapSchema, type} from "@colyseus/schema";

export class Player extends Schema {
    @type("number") pos: number = 1; // 1~6
    @type("number") dice: number = 1; //1~6

}

export class GameState extends Schema {
    @type({map: Player}) players = new MapSchema<Player>();
}