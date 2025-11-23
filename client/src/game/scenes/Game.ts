import { Cameras, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { current_room } from "../../network/network";
import {
    ColliderDesc,
    EventQueue,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";
import { Player } from "../classes/player/player";
import { ball } from "../classes/ball/ball";
import {
    barrier_network_data,
    players_network_data,
} from "../../network/network_types";
import { Barrier } from "../classes/barrier/Barrier";

export class Game extends Scene {
    map: Phaser.Tilemaps.Tilemap;
    my_tower: { x: number; y: number }[];
    enemy_tower: { x: number; y: number }[];
    graphics: Phaser.GameObjects.Graphics;
    world: World;
    frontend_players: { [key: string]: Player };
    frontend_barriers: { [key: string]: Barrier };
    ball: ball;
    eventQueue: EventQueue;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("player", "player/square.png");
        this.load.audio("bounce", "sounds/bounce_sound.mp3");
        this.load.audio("score", "sounds/score_sound.mp3");
        this.load.audio("game_sound", "sounds/game_sound_sound.mp3");
        this.load.tilemapTiledJSON("map_json", "maps/json/map1.json");
    }

    create() {
        const width = Number(this.game.config.width);
        const height = Number(this.game.config.height);
        this.world = new World({ x: 0, y: 0 });
        this.eventQueue = new EventQueue(true);
        const centerX = width / 2;
        const centerY = height / 2;
        this.input.mouse?.disableContextMenu();
        this.cameras.main.setBackgroundColor(
            Phaser.Display.Color.GetColor(51, 49, 49)
        );
        this.cameras.main.setBounds(0, 0, width, height);
        this.graphics = this.add.graphics();
        this.ball = new ball(this, this.world, centerX, centerY);
        this.frontend_players = {};
        this.frontend_barriers = {};

        this.createMap();
        // this.sound.play("game_sound", { loop: true, volume: 0.3 });

        current_room.onMessage(
            "update_players",
            (data: players_network_data) => {
                for (const id in data) {
                    const backend_player = data[id];
                    if (!this.frontend_players[id]) {
                        this.frontend_players[id] = new Player(
                            this,
                            this.world,
                            backend_player.position.x,
                            backend_player.position.y,
                            backend_player.color
                        );
                        this.frontend_players[id].sync();
                    } else {
                        const pos = {
                            x: Phaser.Math.Linear(
                                this.frontend_players[
                                    id
                                ].rigid_body.translation().x,
                                backend_player.position.x,
                                0.5
                            ),
                            y: Phaser.Math.Linear(
                                this.frontend_players[
                                    id
                                ].rigid_body.translation().y,
                                backend_player.position.y,
                                0.5
                            ),
                        };

                        this.frontend_players[id].rigid_body.setTranslation(
                            pos,
                            true
                        );
                        this.frontend_players[id].sync();
                    }
                }
            }
        );

        current_room.onMessage(
            "update_barriers",
            (data: barrier_network_data) => {
                for (const id in data) {
                    const backend_barrier = data[id];

                    if (!this.frontend_barriers[id]) {
                        this.frontend_barriers[id] = new Barrier(
                            this,
                            this.world,
                            backend_barrier.position,
                            backend_barrier.length,
                            backend_barrier.angle
                        );
                        this.frontend_barriers[id].sync();
                    } else {
                        this.frontend_barriers[id].rigid_body.setTranslation(
                            backend_barrier.position,
                            true
                        );
                        this.frontend_barriers[id].rigid_body.setRotation(
                            backend_barrier.angle,
                            true
                        );
                        this.frontend_barriers[id].body.x =
                            this.frontend_barriers[
                                id
                            ].rigid_body.translation().x;
                        this.frontend_barriers[id].body.y =
                            this.frontend_barriers[
                                id
                            ].rigid_body.translation().y;
                        this.frontend_barriers[id].body.rotation =
                            this.frontend_barriers[id].rigid_body.rotation();
                    }
                }
                for (const id in this.frontend_barriers) {
                    if (!data[id]) {
                        this.frontend_barriers[id].destroy(
                            this.world,
                            this.frontend_barriers,
                            id
                        );
                    }
                }
            }
        );
        current_room.onMessage(
            "update_puck",
            (data: {
                position: { x: number; y: number };
                speed: number;
                angle: number;
            }) => {
                this.ball.rigid_body.setTranslation(data.position, true);
                this.ball.angle = data.angle;
                if (data.speed > 1000) {
                    this.ball.particles.start();
                } else {
                    this.ball.particles.stop();
                }
                this.ball.sync();
            }
        );
        current_room.onMessage(
            "update_score",
            (data: { [key: string]: number }) => {
                const scores = Object.values(data);
                this.sound.play("score");
                EventBus.emit("update_score", scores);
                this.cameras.main.shake(400, 0.007);
            }
        );
        current_room.onMessage(
            "update_timer",
            (data: { minute: number; second: number }) => {
                EventBus.emit("update_timer", data);
            }
        );

        current_room.onMessage("bounce", () => {
            this.sound.play("bounce");
        });
        current_room.onMessage("winner_selected", (data) => {
            EventBus.emit("winner_selected", data);
        });

        EventBus.emit("current-scene-ready", this);
    }
    update(time: number, delta: number): void {
        this.world.step(this.eventQueue);
        if (this.frontend_players[current_room.sessionId]) {
            this.frontend_players[current_room.sessionId].movePlayer(delta);
            this.controlCamera();
        }

        // this.checkCollision();
    }
    createMap() {
        this.map = this.make.tilemap({ key: "map_json" });
        this.graphics.lineStyle(10, 0xffffff);
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.preFX?.addGlow(0xff0000, 0, 0, true, 0.2, 32);

        this.cameras.main.setZoom(1.2);
        console.log(this.map);
        this.map.objects.forEach((object) => {
            if (object.name === "border") {
                object.objects.forEach((obj) => {
                    const points = obj.polygon?.map((p) => ({
                        x: obj.x! + p.x,
                        y: obj.y! + p.y,
                    }));
                    this.graphics.beginPath();
                    this.graphics.moveTo(points![0].x, points![0].y);
                    for (let i = 1; i < points!.length; i++) {
                        this.graphics.lineTo(points![i].x, points![i].y);
                    }
                    this.graphics.lineTo(points![0].x, points![0].y);
                    this.graphics.strokePath();
                    this.graphics.fillPath();
                });
            }
            if (object.name === "goal") {
                object.objects.forEach((obj) => {
                    this.add.rectangle(
                        obj.x! + obj.width! / 2,
                        obj.y! + obj.height! / 2,
                        obj.width,
                        obj.height,
                        0xfff000
                    );
                });
            }
            if (object.name === "middle_line") {
                const g = this.add.graphics();
                g.lineStyle(5, 0xffffff);
                g.beginPath();
                g.moveTo(object.objects[0].x!, object.objects[0].y!);
                g.lineTo(object.objects[1].x!, object.objects[1].y!);
                g.strokePath();
                const width = Number(this.game.config.width);
                const height = Number(this.game.config.height);
                this.add
                    .circle(width / 2, height / 2, 70, 0x000000)
                    .setStrokeStyle(5, 0xffffff);
            }
            if (object.name === "collision") {
                object.objects.forEach((obj) => {
                    const vertices = obj.polygon!.map((p: any) => [
                        obj.x + p.x,
                        obj.y + p.y,
                    ]);

                    const flatPoints = new Float32Array(vertices.flat());

                    const rbDesc = RigidBodyDesc.fixed().setUserData({
                        type: "wall",
                    });
                    const rb = this.world.createRigidBody(rbDesc);

                    // Create a collider from polygon (closed shape)
                    let colliderDesc = ColliderDesc.polyline(flatPoints);

                    if (!colliderDesc) {
                        console.log(
                            "Polygon not convex, using polyline:",
                            vertices
                        );
                        return;
                    }

                    this.world.createCollider(colliderDesc, rb);
                });
            }
        });
    }
    controlCamera() {
        const players = Object.values(this.frontend_players);

        const cam = this.cameras.main;

        // === 1. Bounding box for all targets ===
        const xs = [
            players[0]?.rigid_body.translation().x,
            players[1]?.rigid_body.translation().x,
            this.ball.rigid_body.translation().x,
        ];
        const ys = [
            players[0]?.rigid_body.translation().y,
            players[1]?.rigid_body.translation().y,
            this.ball.rigid_body.translation().y,
        ];

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        // === 2. Camera center ===
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        cam.centerOn(centerX, centerY);

        // === 3. Compute spread for zoom ===
        const width = maxX - minX;
        const height = maxY - minY;
        const dist = Math.max(width, height);

        // === 4. Zoom ===
        const minZoom = 1;
        const maxZoom = 1.5;
        const maxDist = Number(this.game.config.width);

        let targetZoom = Phaser.Math.Linear(maxZoom, minZoom, dist / maxDist);
        targetZoom = Phaser.Math.Clamp(targetZoom, minZoom, maxZoom);

        cam.zoom = Phaser.Math.Linear(cam.zoom, targetZoom, 0.05);
    }
}

