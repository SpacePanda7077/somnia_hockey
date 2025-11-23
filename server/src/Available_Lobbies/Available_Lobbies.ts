import { Client } from "colyseus";
import { Waiting_Room } from "../classes/waiting_room/waiting_room";

export const Available_Lobbies: Waiting_Room[] = [];

export function findRoom() {
  let room;
  if (Available_Lobbies.length >= 10) return;
  if (Available_Lobbies.length <= 0) {
    const waiting_room = new Waiting_Room();
    room = waiting_room;
    Available_Lobbies.push(waiting_room);
  } else {
    const available_room = Available_Lobbies.find(
      (r) => r.connected_clients.length < 2 && r.inGame === false
    );
    if (available_room) {
      room = available_room;
    } else {
      const waiting_room = new Waiting_Room();
      room = waiting_room;
      Available_Lobbies.push(waiting_room);
    }
  }
  return room;
}
export function findMyRoom(client: Client) {
  const room = Available_Lobbies.find((r) =>
    r.connected_clients.find((c) => c.sessionId === client.sessionId)
  );
  if (room) {
    return room;
  }
  console.log("you are not in any room");
}
