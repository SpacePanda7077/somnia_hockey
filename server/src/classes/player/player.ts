import {
  ActiveEvents,
  ColliderDesc,
  QueryFilterFlags,
  Ray,
  RigidBody,
  RigidBodyDesc,
  World,
} from "@dimforge/rapier2d-compat";
import {
  Angle_Between,
  Distance_Between,
} from "../../helpers/functions/calculations";
import { Barrier } from "../barrier/Barrier";
import uniqid from "uniqid";
import { Clock } from "colyseus";
import e from "express";

export class Player {
  world: World;
  rigid_body: RigidBody;
  collider: any;
  speed: number;
  isColliding: boolean;
  type: number;
  buildStart: { x: number; y: number };
  wallcheck_rays: Ray[];
  score: number;
  address: string;
  inputVector: { x: number; y: number };
  isBuilding: boolean;
  numberOfBarrier: number;
  maxNumberOfBarrier: number;
  color: string;
  constructor(world: World, x: number, y: number) {
    this.world = world;
    this.speed = 2000;
    this.type = 0;
    this.score = 0;
    this.address = "";
    this.color = "";
    this.numberOfBarrier = 0;
    this.maxNumberOfBarrier = 3;

    this.isColliding = false;
    this.inputVector = { x: 0, y: 0 };
    this.wallcheck_rays = [];
    this.createPlayer(x, y);
    this.isBuilding = false;
    this.buildStart = { x: 0, y: 0 };
  }
  createPlayer(x: number, y: number) {
    const ridid_body_desc = RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setCcdEnabled(true)
      .setUserData({ type: "player" });
    this.rigid_body = this.world.createRigidBody(ridid_body_desc);
    const collider_desc = ColliderDesc.cuboid(100, 100).setActiveEvents(
      ActiveEvents.COLLISION_EVENTS
    );
    this.collider = this.world.createCollider(collider_desc, this.rigid_body);
  }
  handleInputs(inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  }) {
    if (inputs.left) {
      this.inputVector.x = -1;
    } else if (inputs.right) {
      this.inputVector.x = 1;
    }
    if (inputs.up) {
      this.inputVector.y = -1;
    } else if (inputs.down) {
      this.inputVector.y = 1;
    }
    if (!inputs.left && !inputs.right) {
      this.inputVector.x = 0;
    }
    if (!inputs.up && !inputs.down) {
      this.inputVector.y = 0;
    }
  }
  movePlayer(centerX: number) {
    const dt = 1000 / 30;
    const vector = this.normalizeVector(this.inputVector);
    const velocity = {
      x: vector.x * this.speed,
      y: vector.y * this.speed,
    };
    this.limit_movement(centerX);

    this.rigid_body.setLinvel({ x: velocity.x, y: velocity.y }, true);
  }
  limit_movement(centerX: number) {
    const position = this.rigid_body.translation();
    if (this.type === 1) {
      if (position.x > centerX) {
        this.rigid_body.setTranslation({ x: centerX, y: position.y }, true);
      }
    } else {
      if (position.x < centerX) {
        this.rigid_body.setTranslation({ x: centerX, y: position.y }, true);
      }
    }
  }
  start_build() {
    if (!this.isBuilding) {
      this.buildStart = {
        x: this.rigid_body.translation().x,
        y: this.rigid_body.translation().y,
      };
      this.isBuilding = true;
    }
  }
  build(
    barriers: { [key: string]: Barrier },
    barrier_network_data: {
      [key: string]: {
        position: { x: number; y: number };
        angle: number;
        length: number;
      };
    },
    clock: Clock,
    server: any
  ) {
    if (!this.isBuilding) return;
    if (this.numberOfBarrier >= this.maxNumberOfBarrier) return;
    let length = Distance_Between(
      this.rigid_body.translation().x,
      this.rigid_body.translation().y,
      this.buildStart.x,
      this.buildStart.y
    );
    if (length < 50) {
      this.isBuilding = false;
      return;
    } else if (length > 400) {
      length = 400;
    }
    const angle = Angle_Between(
      this.rigid_body.translation().x,
      this.rigid_body.translation().y,
      this.buildStart.x,
      this.buildStart.y
    );
    const end = this.rigid_body.translation();
    const barrier_uid = uniqid();
    const barrier = new Barrier(
      this.world,
      this.buildStart,
      end,
      length,
      angle,
      barrier_uid,
      this
    );
    barrier.startTimer(
      clock,
      this.world,
      barriers,
      barrier_network_data,
      server
    );
    const position = barrier.rigid_body.translation();
    barriers[barrier_uid] = barrier;
    barrier_network_data[barrier_uid] = {
      position: position,
      angle: angle,
      length: length,
    };

    this.numberOfBarrier += 1;
    this.isBuilding = false;
  }
  normalizeVector(vector: { x: number; y: number }) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: vector.x / length, y: vector.y / length };
  }
  sync() {
    return { position: this.rigid_body.translation(), color: this.color };
  }
}
