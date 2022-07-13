import {Schema, MapSchema, type} from "@colyseus/schema";

export class Player extends Schema {
    @type("number") pos: number = 0;
    @type("number") dice: number = 1;

}

export class GameState extends Schema {
    @type({map: Player}) players = new MapSchema<Player>();
}