import {
    ColliderDesc,
    KinematicCharacterController,
    RigidBody,
    RigidBodyDesc,
    World,
    ActiveEvents,
} from "@dimforge/rapier2d-compat";
import { current_room } from "../../../network/network";

export class Player {
    scene: Phaser.Scene;
    world: World;
    body: Phaser.GameObjects.Sprite;
    rigid_body: RigidBody;
    collider: any;
    character_controller: KinematicCharacterController;
    pointer: Phaser.Input.Pointer;
    speed: number;
    isColliding: boolean;
    left: Phaser.Input.Keyboard.Key | undefined;
    right: Phaser.Input.Keyboard.Key | undefined;
    up: Phaser.Input.Keyboard.Key | undefined;
    down: Phaser.Input.Keyboard.Key | undefined;
    inputVector: Phaser.Math.Vector2;
    serverInput: { left: boolean; right: boolean; up: boolean; down: boolean };
    color: string;

    constructor(
        scene: Phaser.Scene,
        world: World,
        x: number,
        y: number,
        color: string
    ) {
        this.scene = scene;
        this.world = world;
        this.speed = 2000;
        this.color = color;

        this.isColliding = false;
        this.inputVector = new Phaser.Math.Vector2(0, 0);
        this.serverInput = {
            left: false,
            right: false,
            up: false,
            down: false,
        };
        this.createPlayer(x, y);
        this.createKeys();
        this.dash_and_build();
    }
    createPlayer(x: number, y: number) {
        // 1. Create a Graphics object
        console.log("Player color:", this.color);

        this.body = this.scene.add
            .sprite(x, y, "player")
            .setTint(Phaser.Display.Color.HexStringToColor(this.color).color)
            .setDepth(100);

        this.body.preFX?.addBloom(0xffffff, 1, 1, 2, 1.2);

        const ridid_body_desc = RigidBodyDesc.kinematicVelocityBased()
            .setTranslation(x, y)
            .setCcdEnabled(true)
            .setUserData({ type: "player" });
        this.rigid_body = this.world.createRigidBody(ridid_body_desc);
        const collider_desc = ColliderDesc.cuboid(100, 100).setActiveEvents(
            ActiveEvents.COLLISION_EVENTS
        );
        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );
    }

    createKeys() {
        this.left = this.scene.input.keyboard?.addKey("a");
        this.right = this.scene.input.keyboard?.addKey("d");
        this.up = this.scene.input.keyboard?.addKey("w");
        this.down = this.scene.input.keyboard?.addKey("s");
    }
    handleInputs() {
        // handle input down

        if (this.left?.isDown) {
            this.inputVector.x = -1;
            this.serverInput.left = true;
        }
        if (this.right?.isDown) {
            this.inputVector.x = 1;
            this.serverInput.right = true;
        }
        if (this.up?.isDown) {
            this.inputVector.y = -1;
            this.serverInput.up = true;
        }
        if (this.down?.isDown) {
            this.inputVector.y = 1;
            this.serverInput.down = true;
        }
        if (this.left?.isUp) {
            this.serverInput.left = false;
        }
        if (this.right?.isUp) {
            this.serverInput.right = false;
        }
        if (this.up?.isUp) {
            this.serverInput.up = false;
        }
        if (this.down?.isUp) {
            this.serverInput.down = false;
        }
        if (!this.left?.isDown && !this.right?.isDown) {
            this.inputVector.x = 0;
        }
        if (!this.up?.isDown && !this.down?.isDown) {
            this.inputVector.y = 0;
        }

        // send input to server
        current_room.send("move", this.serverInput);
    }
    dash_and_build() {
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) {
                current_room.send("dash");
            } else if (pointer.button === 2) {
                current_room.send("build");
            }
        });
        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) {
                current_room.send("cancel_dash");
            } else if (pointer.button === 2) {
                current_room.send("cancel_build");
            }
        });
    }

    movePlayer(delta: number) {
        this.handleInputs();
        this.inputVector.normalize();
        const velocity = {
            x: this.inputVector.x * this.speed,
            y: this.inputVector.y * this.speed,
        };
        this.rigid_body.setLinvel({ x: velocity.x, y: velocity.y }, true);
    }
    sync() {
        const position = this.rigid_body.translation();
        this.body.x = Phaser.Math.Linear(this.body.x, position.x, 0.5);
        this.body.y = Phaser.Math.Linear(this.body.y, position.y, 0.5);
    }
}

