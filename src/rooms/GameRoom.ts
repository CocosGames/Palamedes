import {Room, Client} from "colyseus";
import {GameState, Player} from "./schema/GameState";

export class GameRoom extends Room<GameState> {

    onCreate(options: any) {
        this.setState(new GameState());

        this.onMessage("move", (client, message) => {
            console.log("message move received:" + message.dir);
            if (message.dir == "l") {
                this.state.players.get(client.sessionId).pos--;
            } else if (message.dir == "r") {
                this.state.players.get(client.sessionId).pos++;
            }
        });

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
