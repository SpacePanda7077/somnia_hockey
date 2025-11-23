import {
  ActiveEvents,
  ColliderDesc,
  KinematicCharacterController,
  RigidBody,
  RigidBodyDesc,
  World,
} from "@dimforge/rapier2d-compat";

export class Ball {
  world: World;
  rigid_body: RigidBody;
  collider: any;
  character_controller: KinematicCharacterController;
  velocity: { x: number; y: number };

  constructor(world: World, x: number, y: number) {
    this.world = world;
    this.createPlayer(x, y);
  }
  createPlayer(x: number, y: number) {
    const ridid_body_desc = RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setUserData({ type: "ball" })
      .setCcdEnabled(true);
    this.rigid_body = this.world.createRigidBody(ridid_body_desc);
    const collider_desc = ColliderDesc.ball(30)
      .setRestitution(1.2)
      .setFriction(0)
      .setActiveEvents(ActiveEvents.COLLISION_EVENTS);
    this.collider = this.world.createCollider(collider_desc, this.rigid_body);
    this.rigid_body.setLinvel({ x: -1 * 500, y: 0 }, true);
  }

  sync() {
    const position = this.rigid_body.translation();
    return position;
  }
}
