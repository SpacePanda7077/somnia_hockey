import {
  ColliderDesc,
  RigidBody,
  RigidBodyDesc,
  World,
} from "@dimforge/rapier2d-compat";
import fs from "fs";

export class World_Map {
  goalPost: { body: RigidBody; owner: string }[];
  width: any;
  height: any;
  centerX: number;
  centerY: number;
  constructor(world: World, name: string) {
    this.goalPost = [];
    this.create_map(world, name);
  }
  create_map(world: World, name: string) {
    const mapData = fs.readFileSync(`src/maps/${name}.json`, "utf-8");
    const map = JSON.parse(mapData);
    this.width = map.width * 32;
    this.height = map.height * 32;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    map.layers.forEach((layer: { name: string; objects: any[] }) => {
      if (layer.name === "collision") {
        layer.objects.forEach((obj) => {
          const vertices = obj.polygon!.map((p: any) => [
            obj.x + p.x,
            obj.y + p.y,
          ]);

          const flatPoints = new Float32Array(vertices.flat());

          const rbDesc = RigidBodyDesc.fixed().setUserData({
            type: "wall",
          });
          const rb = world.createRigidBody(rbDesc);

          // Create a collider from polygon (closed shape)
          let colliderDesc = ColliderDesc.polyline(flatPoints);

          if (!colliderDesc) {
            console.log("Polygon not convex, using polyline:", vertices);
            return;
          }

          world.createCollider(colliderDesc, rb);
        });
      }
      if (layer.name === "goal") {
        layer.objects.forEach((obj) => {
          const rbDesc = RigidBodyDesc.fixed()
            .setTranslation(obj.x + obj.width / 2, obj.y + obj.height / 2)
            .setUserData({
              type: "goal",
              owner: "",
            });
          const rb = world.createRigidBody(rbDesc);
          const colDesc = ColliderDesc.cuboid(
            obj.width / 2,
            obj.height / 2
          ).setSensor(true);
          world.createCollider(colDesc, rb);
          this.goalPost.push({ body: rb, owner: "" });
        });
      }
    });
  }
}
