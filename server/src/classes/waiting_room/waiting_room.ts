import { Client } from "colyseus";

export class Waiting_Room {
  roomId: string;
  connected_clients: Client[];
  ready_clients: Client[];
  inGame: boolean;
  tempRoomId: string;
  entry_fee: number;
  constructor() {
    this.tempRoomId = "";
    this.roomId = "";
    this.inGame = false;
    this.connected_clients = [];
    this.ready_clients = [];
    this.entry_fee = 0;
  }
  add_Player(client: Client) {
    const already_client = this.connected_clients.find(
      (c) => c.sessionId === client.sessionId
    );
    if (already_client) {
      console.log("already in room");
      return;
    }
    this.connected_clients.push(client);
  }
  remove_Player(client: Client) {
    const already_client = this.connected_clients.find(
      (c) => c.sessionId === client.sessionId
    );
    if (!already_client) return;
    const index = this.connected_clients.indexOf(already_client);
    this.connected_clients.splice(index, 1);
  }
}
