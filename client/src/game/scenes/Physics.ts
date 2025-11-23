import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import RAPIER from "@dimforge/rapier2d-compat";

export class Physics extends Scene {
    map: Phaser.Tilemaps.Tilemap;
    my_tower: { x: number; y: number }[];
    enemy_tower: { x: number; y: number }[];
    constructor() {
        super("Physics");
    }

    async preload() {
        await this.initialize();
    }

    create() {
        EventBus.emit("current-scene-ready", this);
    }
    async initialize() {
        await RAPIER.init();
        this.scene.start("Game");
    }
}

