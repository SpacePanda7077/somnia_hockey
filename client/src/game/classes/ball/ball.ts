import {
    ActiveEvents,
    ColliderDesc,
    KinematicCharacterController,
    RigidBody,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";
import { Player } from "../player/player";

export class ball {
    scene: Phaser.Scene;
    world: World;
    body: Phaser.GameObjects.Arc;
    rigid_body: RigidBody;
    collider: any;
    character_controller: KinematicCharacterController;
    velocity: { x: number; y: number };
    pointer: Phaser.Input.Pointer;
    particles: Phaser.GameObjects.Particles.ParticleEmitter;
    angle: number;
    constructor(scene: Phaser.Scene, world: World, x: number, y: number) {
        this.scene = scene;
        this.world = world;
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.createPlayer(x, y);
    }
    createPlayer(x: number, y: number) {
        this.body = this.scene.add.circle(x, y, 30, 0xffffff).setDepth(100);
        this.create_particle();
        const ridid_body_desc = RigidBodyDesc.dynamic()
            .setTranslation(x, y)
            .setUserData({ type: "ball" })
            .setCcdEnabled(true);
        this.rigid_body = this.world.createRigidBody(ridid_body_desc);
        const collider_desc = ColliderDesc.ball(30)
            .setRestitution(1)
            .setDensity(10)
            .setFriction(0);

        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );
    }
    create_particle() {
        // generate flare texture
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture("flares", 32, 32);
        graphics.destroy();

        this.particles = this.scene.add.particles(0, 0, "flares", {
            frame: "white",
            lifespan: 500,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            angle: this.angle,
            frequency: 50,
            quantity: 5,
        });
        this.particles.startFollow(this.body);
        this.particles.stop();
    }

    sync() {
        const position = this.rigid_body.translation();
        this.body.setPosition(position.x, position.y);
    }
}

