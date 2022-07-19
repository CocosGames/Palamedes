import {Room, Client} from "colyseus";
import {GameState, Player} from "./schema/GameState";

export class GameRoom extends Room<GameState> {

    public static DROP_TIMEOUT = 10;
    public static  BOARD_WIDTH = 6;
    public static  BOARD_HEIGHT = 10;
    public static  PLAYER_NUM = 2;
    public static  INIT_LINES = 2;
    public static  DICE_NUM = 6; // 1~6

    onCreate(options: any) {
        this.setState(new GameState());

        this.onMessage("move", (client, message) => {
                console.log("message move received:" + message.dir);
                if (message.dir == "l") {
                    this.state.players.get(client.sessionId).pos--;
                } else if (message.dir == "r") {
                    this.state.players.get(client.sessionId).pos++;
                }
            }
        );

        this.onMessage("roll", (client, message) => {
                console.log("message roll recelived.")
                if (this.state.players.get(client.sessionId).dice==6) {
                    this.state.players.get(client.sessionId).dice = 1
                } else {
                    this.state.players.get(client.sessionId).dice++;
                }
            }
        );

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
