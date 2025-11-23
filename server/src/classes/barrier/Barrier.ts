import {
  ActiveEvents,
  Collider,
  ColliderDesc,
  RigidBody,
  RigidBodyDesc,
  World,
} from "@dimforge/rapier2d-compat";
import { Clock, Server } from "colyseus";
import { Player } from "../player/player";

export class Barrier {
  rigid_body: RigidBody;
  collider: Collider;
  length: number;
  id: string;
  owner: Player;
  constructor(
    world: World,
    start: { x: number; y: number },
    end: { x: number; y: number },
    length: number,
    angle: number,
    id: string,
    owner: Player
  ) {
    this.length = length;
    this.id = id;
    this.owner = owner;
    this.create_barrier(world, start, end, length, angle);
  }
  create_barrier(
    world: World,
    start: { x: number; y: number },
    end: { x: number; y: number },
    length: number,
    angle: number
  ) {
    const pos = this.getPosition(start, end);
    const ridid_body_desc = RigidBodyDesc.dynamic()
      .setTranslation(pos.x, pos.y)
      .setRotation(angle)
      .setCcdEnabled(true)
      .setUserData({ type: "barrier" });
    this.rigid_body = world.createRigidBody(ridid_body_desc);
    const collider_desc = ColliderDesc.cuboid(length / 2, 30);
    this.collider = world.createCollider(collider_desc, this.rigid_body);
  }
  getPosition(start: { x: number; y: number }, end: { x: number; y: number }) {
    const dist = {
      x: start.x - end.x,
      y: start.y - end.y,
    };
    const pos = {
      x: start.x - dist.x / 2,
      y: start.y - dist.y / 2,
    };
    return pos;
  }
  startTimer(
    clock: Clock,
    world: World,
    barriers: { [key: string]: Barrier },
    barrier_network_data: {
      [key: string]: {
        position: { x: number; y: number };
        angle: number;
        length: number;
      };
    },
    server: any
  ) {
    clock.setTimeout(() => {
      world.removeRigidBody(this.rigid_body);
      delete barriers[this.id];
      delete barrier_network_data[this.id];
      this.owner.numberOfBarrier--;
      //server.broadcast("remove_barrier", { id: this.id });
    }, 6000);
  }
}
