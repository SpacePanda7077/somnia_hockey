import { Client, Room } from "colyseus.js";

export const client = new Client("https://somnia-hockey.onrender.com/");
export let current_room: Room;
export let network_color = "#ff0000";

export async function join_Room() {
    const room = await client.joinOrCreate("lobby_room");
    current_room = room;
}
export async function join_Room_By_Id(id: string, address: string) {
    const room = await client.joinById(id, { address, network_color });
    current_room = room;
}

export function set_Network_Color(color: string) {
    network_color = color;
}

