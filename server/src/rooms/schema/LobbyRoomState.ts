import { Schema, type } from "@colyseus/schema";

export class Lobby_Room_State extends Schema {
  @type("string") mySynchronizedProperty: string = "Hello world";
}
