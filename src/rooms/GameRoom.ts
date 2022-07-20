import {Room, Client} from "colyseus";
import {GameState, Player} from "./schema/GameState";
import {ArraySchema} from "@colyseus/schema";

export class GameRoom extends Room<GameState> {

    public static DROP_TIMEOUT = 10;
    public static BOARD_WIDTH = 6;
    public static BOARD_HEIGHT = 10;
    public static PLAYER_NUM = 2;
    public static INIT_LINES = 2;
    public static DICE_NUM = 6; // 1~6

    onCreate(options: any) {
        this.setState(new GameState());
        this.clock.setInterval(() => {
            this.clients.forEach((c, i, a) => {
                this.addLines(c);
            });
        }, GameRoom.DROP_TIMEOUT*1000);
        this.onMessage("move", (client, message) => {
                console.log("message move received: " + message.dir);
                if (message.dir == "l") {
                    this.state.players.get(client.sessionId).pos--;
                } else if (message.dir == "r") {
                    this.state.players.get(client.sessionId).pos++;
                }
            }
        );

        this.onMessage("roll", (client, message) => {
                console.log("message roll recelived.")
                if (this.state.players.get(client.sessionId).dice == 6) {
                    this.state.players.get(client.sessionId).dice = 1
                } else {
                    this.state.players.get(client.sessionId).dice++;
                }
            }
        );

        this.onMessage("shoot", (client, message) => {
                console.log("message shoot recelived: " + message.i);
                // this.state.players.get(client.sessionId).board[message.i-1] = 0;
                let col = [];
                let clean = true;
                for (var n = this.state.players.get(client.sessionId).pos - 1; n < GameRoom.BOARD_WIDTH * GameRoom.BOARD_HEIGHT; n += GameRoom.BOARD_WIDTH) {
                    col.push(n);
                }
                col = col.reverse();
                for (var m = 0; m < col.length; m++) {
                    if (this.state.players.get(client.sessionId).board[col[m]] == 0 || this.state.players.get(client.sessionId).board[col[m]] == null)
                        continue;
                    if (this.state.players.get(client.sessionId).board[col[m]] == this.state.players.get(client.sessionId).dice && col[m] == message.i - 1) {
                        this.state.players.get(client.sessionId).board[col[m]] = 0;
                        this.state.players.get(client.sessionId).history.push(this.state.players.get(client.sessionId).dice);
                        if (this.state.players.get(client.sessionId).history.length > GameRoom.BOARD_WIDTH)
                            // this.state.players.get(client.sessionId).history.shift();
                            this.state.players.get(client.sessionId).history = this.state.players.get(client.sessionId).history.slice(this.state.players.get(client.sessionId).history.length - GameRoom.BOARD_WIDTH, this.state.players.get(client.sessionId).history.length);
                        clean = false;
                    }
                    break;
                }
                if (!clean) {
                    let removeZeros = true;
                    let board = this.state.players.get(client.sessionId).board;
                    for (var l = board.length - 1; l >= board.length - GameRoom.BOARD_WIDTH; l--) {
                        if (board[l] != 0) {
                            removeZeros = false;
                            break;
                        }
                    }
                    if (removeZeros)
                        this.removeLines(client, 1);
                }
            }
        );
    }

    removeLines(c: Client, l: number = 1) {
        let b = this.state.players.get(c.sessionId).board;
        this.state.players.get(c.sessionId).board = b.slice(0, b.length - l * GameRoom.BOARD_WIDTH);
        console.log(l + " lines removed!");
    }

    addLines(c: Client, l: number = 1) {
        let b = this.state.players.get(c.sessionId).board as ArraySchema<number>;
        for (var i = 0; i < l; i++) {
            let line = [];
            for (var j = 0; j < GameRoom.BOARD_WIDTH; j++) {
                line.push(Math.ceil(Math.random() * GameRoom.DICE_NUM));
            }
            for (var k = line.length-1; k >= 0; k--) {
                this.state.players.get(c.sessionId).board.unshift(line[k]);
            }
        }
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.state.players.set(client.sessionId, new Player());
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
