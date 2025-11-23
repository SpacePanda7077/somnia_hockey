import { Schema, type } from "@colyseus/schema";

export class Game_Room_State extends Schema {
  @type("string") mySynchronizedProperty: string = "Hello world";
}
