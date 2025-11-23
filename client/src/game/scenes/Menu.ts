import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import {
    join_Room,
    current_room,
    join_Room_By_Id,
} from "../../network/network";
import { address } from "../../somnia/somnia";
import { Room } from "colyseus.js";

export class Menu extends Scene {
    map: Phaser.Tilemaps.Tilemap;
    room: Room;
    menu_container: Phaser.GameObjects.Container;
    address: string;

    constructor() {
        super("Menu");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("bg", "menu_bg.jpg");
    }

    async create() {
        this.removeLinstiners();
        const width = Number(this.game.config.width);
        const height = Number(this.game.config.height);
        const centerX = width / 2;
        const centerY = height / 2;
        const bg = this.add.image(0, 0, "bg").setOrigin(0);
        const sx = width / bg.width;
        const sy = height / bg.height;
        bg.setScale(sx, sy);

        await this.joinRoom();

        // Room events ...........................

        this.room.onMessage(
            "deposit_entryfee",
            (data: { id: string; amount: number }) => {
                EventBus.emit("make_payment", {
                    id: data.id,
                    amount: data.amount,
                });
                //this.handlePayEntryfee(data.id);
            }
        );

        this.room.onMessage("start_quick_match", async (id: string) => {
            await join_Room_By_Id(id, address);
            this.scene.stop("Menu");
            this.scene.start("Physics");
        });

        this.room.onMessage("enter_custom_room", async (id: string) => {
            await join_Room_By_Id(id, address);
            this.scene.stop("Menu");
            this.scene.start("Physics");
        });

        this.room.onMessage("available_custom_room", (data) => {
            const map = data.map((array: any) => ({
                roomId: array[1].value.value,
                isOpened: array[2].value.value,
                entryFee: array[3].value.value,
            }));

            EventBus.emit("available_room", map);
        });

        this.room.onMessage("room_created", () => {
            EventBus.emit("room_created");
        });
        this.room.onMessage("leaderboard", (data) => {
            const map = data.map((array: any) => ({
                address: array[0].value.value,
                wins: Number(array[1].value.value),
            }));

            const sorted_map = map.sort(
                (a: { wins: number }, b: { wins: number }) => b.wins - a.wins
            );
            console.log("leaderboard data", sorted_map);

            EventBus.emit("leaderboard_data", sorted_map);
        });

        this.room.onMessage("room_created", () => {
            EventBus.emit("room_created");
        });

        // Event Bus Events .................................//
        // set address ..............

        EventBus.on("entryfee_paid", this.handlePayEntryfee);
        EventBus.on("start_quick_match", this.handleStartMatch);
        EventBus.on("join_custom_room", this.handleJoinCustomLobby);
        EventBus.on("create_custom_lobby", this.handleCreateCustomLobby);
        EventBus.emit("current-scene-ready", this);
    }
    async joinRoom() {
        await join_Room();
        this.room = current_room;
    }
    removeLinstiners() {
        console.log("menu shutdown");
        EventBus.removeAllListeners("create_custom_lobby");
        EventBus.removeAllListeners("join_custom_room");
        EventBus.removeAllListeners("entryfee_paid");
        EventBus.removeAllListeners("make_payment");
        EventBus.removeAllListeners("start_quick_match");
    }
    handleCreateCustomLobby(entryFee: number) {
        console.log("create custom room ");
        current_room.send("create_custom_room", entryFee);
    }
    handlePayEntryfee(id: string) {
        current_room.send("create_quick_match", id);
    }
    handleJoinCustomLobby(id: string) {
        console.log(this.room);
        current_room.send("join_custom_room", id);
    }
    async handleStartMatch(id: string) {
        await join_Room_By_Id(id, address);
        this.scene.stop("Menu");
        this.scene.start("Physics");
    }
}

