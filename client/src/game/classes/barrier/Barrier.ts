import {
    ActiveEvents,
    ColliderDesc,
    RigidBody,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";

export class Barrier {
    rigid_body: RigidBody;
    collider: any;
    length: number;
    scene: Phaser.Scene;
    body: Phaser.GameObjects.Rectangle;
    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number },
        length: number,
        angle: number
    ) {
        this.scene = scene;
        this.length = length;
        this.create_barrier(world, position, length, angle);
    }
    create_barrier(
        world: World,
        position: { x: number; y: number },
        length: number,
        angle: number
    ) {
        this.body = this.scene.add.rectangle(
            position.x,
            position.y,
            length,
            60,
            0x00ff00
        );
        this.body.rotation = angle;
        const ridid_body_desc = RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y)
            .setRotation(angle)
            .setCcdEnabled(true)
            .setUserData({ type: "barrier" });
        this.rigid_body = world.createRigidBody(ridid_body_desc);
        const collider_desc = ColliderDesc.cuboid(length / 2, 30)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setFriction(0);
        this.collider = world.createCollider(collider_desc, this.rigid_body);
    }

    sync() {
        const position = this.rigid_body.translation();
        const rotation = this.rigid_body.rotation();
        this.body.setPosition(position.x, position.y);
        this.body.rotation = rotation;
    }
    destroy(world: World, barriers: any, id: string) {
        this.body.destroy();
        world.removeRigidBody(this.rigid_body);
        delete barriers[id];
    }
}

