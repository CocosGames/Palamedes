import {Room, Client} from "colyseus";
import {GameState, Player} from "./schema/GameState";
import {ArraySchema, MapSchema} from "@colyseus/schema";

export class GameRoom extends Room<GameState> {

    public static DROP_TIMEOUT = 8;
    public static MAGIC_TIMEOUT = 2;
    public static BOARD_WIDTH = 6;
    public static BOARD_HEIGHT = 10;
    public static PLAYER_NUM = 2;
    public static INIT_LINES = 2;
    public static DICE_NUM = 6; // 1~6

    onCreate(options: any) {
        this.setState(new GameState());

        this.onMessage("move", (client, message) => {
                console.log("message move received: " + message.dir);
                if (message.dir == "l") {
                    if (this.state.players.get(client.sessionId).pos > 1)
                        this.state.players.get(client.sessionId).pos--;
                } else if (message.dir == "r") {
                    if (this.state.players.get(client.sessionId).pos < GameRoom.BOARD_WIDTH)
                        this.state.players.get(client.sessionId).pos++;
                }
            }
        );

        this.onMessage("roll", (client, message) => {
                console.log("message roll recelived.");
                if (this.state.players.get(client.sessionId).dice == 6) {
                    this.state.players.get(client.sessionId).dice = 1
                } else {
                    this.state.players.get(client.sessionId).dice++;
                }
            }
        );

        this.onMessage("shoot", (client, message) => {
                console.log("message shoot recelived.");
                this.state.players.get(client.sessionId).shooting = (message.d > 0);
            }
        );

        this.onMessage("boom", (client, message) => {
                console.log("message boom recelived: " + message.i);
                // this.state.players.get(client.sessionId).board[message.i-1] = 0;
                let col = [];
                let clean = true;
                for (var n = this.state.players.get(client.sessionId).pos - 1; n < GameRoom.BOARD_WIDTH * GameRoom.BOARD_HEIGHT; n += GameRoom.BOARD_WIDTH) {
                    col.push(n);
                }
                col = col.reverse();
                let b = this.state.players.get(client.sessionId).board;
                for (var m = 0; m < col.length; m++) {
                    if (b[col[m]] == 0 || b[col[m]] == null)
                        continue;
                    if (b[col[m]] == this.state.players.get(client.sessionId).dice && col[m] == message.i - 1) {
                        this.state.players.get(client.sessionId).board[col[m]] = 0;
                        let h = this.state.players.get(client.sessionId).history.toJSON();
                        if (h.length >= GameRoom.BOARD_WIDTH)
                            h.shift();
                        h.push(this.state.players.get(client.sessionId).dice)
                        this.state.players.get(client.sessionId).history = new ArraySchema<number>().concat(h);
                        // this.state.players.get(client.sessionId).history = h.slice(h.length - GameRoom.BOARD_WIDTH, this.state.players.get(client.sessionId).history.length);
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

        this.onMessage("magic", (client, message) => {
            console.log("message magic recelived.");
            let lr = this.patternMagic(this.state.players.get(client.sessionId).history.toJSON());
            if (lr > 0) {
                this.state.players.get(client.sessionId).magic = lr;
                this.clock.setTimeout(() => {
                    this.state.players.get(client.sessionId).magic = 0;
                }, GameRoom.MAGIC_TIMEOUT * 1000);
                this.state.players.get(client.sessionId).history = new ArraySchema<number>();
                this.removeLines(client, lr);
                for (var i = 0; i <= this.clients.length; i++) {
                    if (this.clients[i].sessionId != client.sessionId) {
                        this.addLines(this.clients[i], lr);
                        break;
                    }

                }
            }
        });
    }

    /*
    PATTERNS "What have you done makes what you have today."

    pattern 6
    123456 654321
    111111 222222 333333 444444 555555 666666
    4 lines

    pattern 6'
    xyxyxy xyzxyz xxxyyy xxyyzz
    3 lines

    pattern 5
    12345x 23456x 65432x 54321x x12345 x23456 x65432 x54321
    11111x x11111 22222x x22222 33333x x33333 44444x x44444 55555x x55555 66666x x66666
    3 lines

    pattern 4
    1234xx 2345xx 3456xx 6543xx 5432xx 4321xx xx1234 xx2345 xx3456 xx4321 xx5432 xx6543
    1111xx xx1111 2222xx xx2222 3333xx xx3333 4444xx xx4444 5555xx xx5555 6666xx xx6666
    2 lines

    pattern 3
    123xxx 234xxx 345xxx 456xxx 654xxx 543xxx 432xxx 321xxx
    xxx123 xxx234 xxx345 xxx456 xxx654 xxx543 xxx432 xxx321
    xxx111 111xxx xxx222 222xxx xxx333 333xxx xxx444 444xxx xxx555 555xxx xxx666 666xxx
    1 line
    */
    patternMagic(history: number[]): number {
        let h = history.join("");
        let pattern6 = ["123456", "654321", "111111", "222222", "333333", "444444", "555555", "666666"];
        for (var i = 0; i < pattern6.length; i++) {
            if (h.indexOf(pattern6[i]) >= 0)
                return 4;
        }
        if (h.length == GameRoom.DICE_NUM) {
            let p6_1 = h.substr(0, 2);
            if (h == (p6_1 + p6_1 + p6_1))
                return 3;
            let p6_2 = h.substr(0, 3);
            if (h == (p6_2 + p6_2))
                return 3;
            let p6_3_1 = h.substr(0, 1);
            let p6_3_2 = h.substr(1, 1);
            let p6_3_3 = h.substr(2, 1);
            let p6_3_4 = h.substr(3, 1);
            let p6_3_5 = h.substr(4, 1);
            let p6_3_6 = h.substr(5, 1);
            if (p6_3_1 == p6_3_2 && p6_3_2 == p6_3_3 && p6_3_4 == p6_3_5 && p6_3_5 == p6_3_6)
                return 3;
            if (p6_3_1 == p6_3_2 && p6_3_3 == p6_3_4 && p6_3_5 == p6_3_6)
                return 3;
        }
        let pattern5 = ["12345", "23456", "65432", "54321", "11111", "22222", "33333", "44444", "55555", "66666"];
        for (var k = 0; k < pattern5.length; k++) {
            if (h.indexOf(pattern5[k]) >= 0)
                return 3;
        }
        let pattern4 = ["1234", "2345", "3456", "6543", "5432", "4321", "1111", "2222", "3333", "4444", "5555", "6666"];
        for (var l = 0; l < pattern4.length; l++) {
            if (h.indexOf(pattern4[l]) >= 0)
                return 2;
        }
        let pattern3 = ["123", "234", "345", "456", "654", "543", "432", "321", "111", "222", "333", "444", "555", "666"];
        for (var m = 0; m < pattern3.length; m++) {
            if (h.indexOf(pattern3[m]) >= 0)
                return 1;
        }

        return 0;
    }

    removeLines(c: Client, l: number = 1) {
        let b = this.state.players.get(c.sessionId).board;
        let bl = Math.ceil(b.length / GameRoom.BOARD_WIDTH);
        if (l > bl)
            l = bl;
        this.state.players.get(c.sessionId).board = b.slice(0, b.length - l * GameRoom.BOARD_WIDTH) as ArraySchema<number>;
    }

    addLines(c: Client, l: number = 1) {
        let b = this.state.players.get(c.sessionId).board;
        let bl = Math.ceil(b.length / GameRoom.BOARD_WIDTH);
        if (l + bl > GameRoom.BOARD_HEIGHT)
            l = GameRoom.BOARD_HEIGHT - bl;
        for (var i = 0; i < l; i++) {
            let line: ArraySchema<number> = new ArraySchema<number>();
            for (var j = 0; j < GameRoom.BOARD_WIDTH; j++) {
                line.push(Math.ceil(Math.random() * GameRoom.DICE_NUM));
            }
            this.state.players.get(c.sessionId).board = line.concat(b.toJSON());
            // for (var k = line.length-1; k >= 0; k--) {
            //     this.state.players.get(c.sessionId).board.unshift(line[k]);
            // }
        }
        if (Math.ceil(this.state.players.get(c.sessionId).board.length / GameRoom.BOARD_WIDTH)>=GameRoom.BOARD_HEIGHT) {
            this.clock.stop();
            this.clock.clear();
            this.state.players.forEach((p,k,m)=>{
                p.ready = false;
            })
        }
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.state.players.set(client.sessionId, new Player());
        this.state.players.get(client.sessionId).ready = true;
        if (this.state.players.size == 2) {
            this.lock();
            this.clients.forEach((c, i, a) => {
                this.addLines(c, GameRoom.INIT_LINES);
            });
            this.clock.setInterval(() => {
                this.clients.forEach((c, i, a) => {
                    this.addLines(c);
                });
            }, GameRoom.DROP_TIMEOUT * 1000);
        }
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
