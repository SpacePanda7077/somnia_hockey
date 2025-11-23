// scripts/publish-one.ts
import "dotenv/config";
import uniqid from "uniqid";
import { SDK, SchemaEncoder } from "@somnia-chain/streams";
import { publicClient, walletClient } from "../somnia/client";
import { chatSchema, leaderboardSchema, seasonSchema } from "../somnia/schema";
import { padHex, toHex, type Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { Room, Client } from "@colyseus/core";
import { Game_Room_State } from "./schema/GameRoomState";
import { Player } from "../classes/player/player";
import { EventQueue, init, World } from "@dimforge/rapier2d-compat";
import { World_Map } from "../classes/map/map";
import { Ball } from "../classes/ball/ball";
import { Angle_Between } from "../helpers/functions/calculations";
import { Available_Lobbies } from "../Available_Lobbies/Available_Lobbies";
import { Waiting_Room } from "../classes/waiting_room/waiting_room";
import { Contract, id, JsonRpcProvider, Wallet } from "ethers";
import { air_hockey_abi } from "../somnia/air_hockey_abi";
import { Barrier } from "../classes/barrier/Barrier";
import { queueTx } from "../globalTransaction/queueTx";

export class Game_Room extends Room<Game_Room_State> {
  maxClients = 2;
  state = new Game_Room_State();
  players: { [key: string]: Player };
  players_network_data: {
    [key: string]: { position: { x: number; y: number }; color: string };
  };
  gameStarted: boolean;
  world: World;
  map: World_Map;
  player_index: number;
  puck: Ball;
  eventQueue: EventQueue;
  scores: { [key: string]: number };
  seconds: number;
  minute: number;
  gameEnded: boolean;
  myRoom: Waiting_Room;
  provider: JsonRpcProvider;
  wallet: Wallet;
  barriers: { [key: string]: Barrier };
  barrier_network_data: {
    [key: string]: {
      position: { x: number; y: number };
      angle: number;
      length: number;
    };
  };

  async onCreate(options: any) {
    await this.initializePhysics();
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    this.map = new World_Map(this.world, "map1");
    this.myRoom = this.getMyRoom(options.id);
    console.log(this.myRoom);
    this.player_index = 0;
    this.players = {};
    this.players_network_data = {};
    this.barriers = {};
    this.barrier_network_data = {};
    this.scores = {};
    this.gameStarted = false;
    this.gameEnded = false;
    this.createPuck();
    this.seconds = 30;
    this.minute = 0;

    this.clock.setInterval(async () => {
      this.seconds--;
      if (this.seconds <= 0 && this.minute > 0) {
        this.minute--;
        this.seconds = 59;
      } else if (this.seconds <= 0 && this.minute <= 0) {
        const players = Object.values(this.players);
        if (players[0].score === players[1].score) {
          this.minute = 1;
          this.seconds = 59;
        } else {
          this.seconds = 0;
          this.minute = 0;
          this.clock.clear();
          this.gameEnded = true;
          await queueTx(async () => {
            await this.selectWinner();
          }); // --- IGNORE ---
        }
      }
      this.broadcast("update_timer", {
        minute: this.minute,
        second: this.seconds,
      });
    }, 1000);

    this.onMessage(
      "move",
      (
        client: Client,
        input: { left: boolean; right: boolean; up: boolean; down: boolean }
      ) => {
        const id = client.sessionId;
        //console.log(input);
        const player = this.players[id];
        player.handleInputs(input);
      }
    );
    this.onMessage("dash", (client: Client) => {
      const id = client.sessionId;
      //console.log(input);
      const player = this.players[id];
      player.speed = 4000;
      player.start_build();
    });

    this.onMessage("cancel_dash", (client: Client) => {
      const id = client.sessionId;
      //console.log(input);
      const player = this.players[id];
      player.speed = 2000;
      player.build(this.barriers, this.barrier_network_data, this.clock, this);
    });
    // start building barriers
    this.onMessage("build", (client: Client) => {
      const id = client.sessionId;
      //console.log(input);
      const player = this.players[id];
    });
    // end building barriers
    this.onMessage("cancel_build", (client: Client) => {
      const id = client.sessionId;
      //console.log(input);
      const player = this.players[id];
    });
    this.setSimulationInterval(() => {
      if (!this.gameStarted) return;
      if (this.gameEnded) return;
      this.world.step(this.eventQueue);
      this.checkCollision();
      for (const id in this.players) {
        const player = this.players[id];
        if (player) {
          player.movePlayer(this.map.centerX);
          const data = player.sync();
          this.players_network_data[id] = data;
        }
      }
      for (const id in this.barriers) {
        if (!this.barriers[id]) return;
        this.barrier_network_data[id] = {
          position: this.barriers[id].rigid_body.translation(),
          angle: this.barriers[id].rigid_body.rotation(),
          length: this.barriers[id].length,
        };
      }
      const puckPosition = this.puck.sync();
      const puckSpeed = Math.sqrt(
        this.puck.rigid_body.linvel().x * this.puck.rigid_body.linvel().x +
          this.puck.rigid_body.linvel().y * this.puck.rigid_body.linvel().y
      );

      const puckAngle = Math.atan2(
        this.puck.rigid_body.linvel().y,
        this.puck.rigid_body.linvel().x
      );

      this.broadcast("update_players", this.players_network_data);
      this.broadcast("update_barriers", this.barrier_network_data);
      this.broadcast("update_puck", {
        position: puckPosition,
        speed: puckSpeed,
        angle: puckAngle,
      });
    }, 1000 / 25);
  }

  onJoin(client: Client, options: any) {
    type userData = {
      type: string;
      owner: string;
    };
    console.log(client.sessionId, "joined!");
    const id = client.sessionId;
    let x = 0;
    if (this.player_index === 0) {
      x = this.map.goalPost[this.player_index].body.translation().x + 200;
    } else {
      x = this.map.goalPost[this.player_index].body.translation().x - 200;
    }
    this.players[id] = new Player(
      this.world,
      x,
      this.map.goalPost[this.player_index].body.translation().y
    );
    (this.map.goalPost[this.player_index].body.userData as userData).owner = id;
    this.players[id].address = options.address;
    this.players[id].color = options.network_color;
    console.log(this.players[id].address);
    this.scores[id] = this.players[id].score;

    this.players[id].type = this.player_index + 1;
    this.players_network_data[id] = {
      position: this.players[id].rigid_body.translation(),
      color: options.network_color,
    };
    this.broadcast("update_players", this.players_network_data);

    const players = Object.values(this.players);
    if (players.length === this.maxClients) {
      this.gameStarted = true;
      console.log("start game");
      this.clients.forEach((client) => {
        client.send("start_game");
      });
    }
    this.player_index++;
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    const roomIndex = Available_Lobbies.indexOf(this.myRoom);
    Available_Lobbies.splice(roomIndex, 1);
    this.world.free();
  }
  getMyRoom(id: string) {
    const room = Available_Lobbies.find((r) => r.tempRoomId === id);
    if (room) {
      room.roomId = this.roomId;
      return room;
    }
  }
  async initializePhysics() {
    await init();
    this.world = new World({ x: 0, y: 0 });
    this.eventQueue = new EventQueue(true);
  }
  createPuck() {
    this.puck = new Ball(this.world, this.map.centerX, this.map.centerY);
  }
  checkCollision() {
    type userdata = {
      type: string;
      owner: string;
    };
    this.eventQueue.drainCollisionEvents((h1, h2, started) => {
      const col1 = this.world.getCollider(h1);
      const col2 = this.world.getCollider(h2);
      const body1 = col1.parent();
      const body2 = col2.parent();
      let b1, b2;
      if ((body1.userData as userdata).type === "ball") {
        b1 = body1;
        b2 = body2;
      } else if ((body2.userData as userdata).type === "ball") {
        b1 = body2;
        b2 = body1;
      } else {
        b1 = body1;
        b2 = body2;
      }
      if (started) {
        if (
          (b1.userData as userdata).type === "ball" &&
          (b2.userData as userdata).type === "goal"
        ) {
          for (const id in this.players) {
            if (id && id !== (b2.userData as userdata).owner) {
              this.players[id].score++;
              this.scores[id] = this.players[id].score;
            }
          }
          this.puck.rigid_body.setLinvel({ x: 0, y: 0 }, true);
          this.puck.rigid_body.setTranslation(
            { x: this.map.centerX, y: this.map.centerY },
            true
          );
          this.broadcast("update_score", this.scores);
        }
        if (
          (b1.userData as userdata).type === "ball" &&
          (b2.userData as userdata).type === "wall"
        ) {
          this.broadcast("bounce");
        }
      }
    });
  }

  async setLeadersboard(address: string, wins: number) {
    // TO DO: set leaderboard onchain
    const publisher = process.env.Public_Key as `0x${string}`;
    const sdk = new SDK({
      public: publicClient as any,
      wallet: walletClient,
    });
    const leaderboard_schemaId = await sdk.streams.computeSchemaId(
      leaderboardSchema
    );
    const season_schemaId = await sdk.streams.computeSchemaId(seasonSchema);

    const isLeaderboardRegistered = await sdk.streams.isDataSchemaRegistered(
      leaderboard_schemaId
    );
    const isseasonRegistered = await sdk.streams.isDataSchemaRegistered(
      season_schemaId
    );
    if (!isLeaderboardRegistered || !isseasonRegistered) {
      await this.registerSchema(season_schemaId, seasonSchema);
      await this.registerSchema(leaderboard_schemaId, leaderboardSchema);

      const season: any = await sdk.streams.getAllPublisherDataForSchema(
        season_schemaId,
        publisher
      );
      if (!season) {
        const encoder = new SchemaEncoder(seasonSchema);
        const data = encoder.encodeData([
          { name: "seasons", value: 1, type: "uint256" },
        ]);
        const setHash = await sdk.streams.set([
          {
            id: toHex("season", { size: 32 }),
            schemaId: season_schemaId,
            data: data,
          },
        ]);
        const receipt = await waitForTransactionReceipt(publicClient as any, {
          hash: setHash as `0x${string}`,
        });
        console.log(setHash);
      }

      await this.createLeaderBoardTx(
        address,
        wins,
        Number(season[0][0].value.value)
      );
      return;
    } else {
      const season: any = await sdk.streams.getAllPublisherDataForSchema(
        season_schemaId,
        publisher
      );
      if (!season) {
        const encoder = new SchemaEncoder(seasonSchema);
        const data = encoder.encodeData([
          { name: "seasons", value: 1, type: "uint256" },
        ]);
        const setHash = await sdk.streams.set([
          {
            id: toHex("season", { size: 32 }),
            schemaId: season_schemaId,
            data: data,
          },
        ]);
        const receipt = await waitForTransactionReceipt(publicClient as any, {
          hash: setHash as `0x${string}`,
        });
        console.log(setHash);
      } else {
        console.log(season[0][0].value.value);
      }

      await this.createLeaderBoardTx(
        address,
        wins,
        Number(season[0][0].value.value)
      );
      return;
    }
  }
  async registerSchema(schemaId: string, schema?: string) {
    // TO DO: register leaderboard schema
    const sdk = new SDK({
      public: publicClient as any,
      wallet: walletClient,
    });
    const txHash = await sdk.streams.registerDataSchemas([
      { id: schemaId, schema },
    ]);

    console.log("Register tx:", txHash);

    const receipt = await waitForTransactionReceipt(publicClient as any, {
      hash: txHash as `0x${string}`,
    });
    console.log("Registered in block:", receipt.blockNumber);
  }
  async createLeaderBoardTx(address: string, wins: number, season: number) {
    // TO DO: create leaderboard entry
    const data = this.encodeLearderBoardScheme(address, wins, season);
    const sdk = new SDK({ public: publicClient as any, wallet: walletClient });
    const schemaId = await sdk.streams.computeSchemaId(leaderboardSchema);
    const setHash = await sdk.streams.set([
      {
        id: padHex(address as `0x${string}`, { size: 32 }),
        schemaId,
        data: data,
      },
    ]);
    const receipt = await waitForTransactionReceipt(publicClient as any, {
      hash: setHash as `0x${string}`,
    });
    console.log(setHash);
  }

  encodeLearderBoardScheme(player: string, wins: number, season: number) {
    const encoder = new SchemaEncoder(leaderboardSchema);
    const data = encoder.encodeData([
      { name: "player", value: player, type: "address" },
      { name: "wins", value: wins, type: "uint256" },
      { name: "season", value: season, type: "uint256" },
    ]);
    return data;
  }
  async getPrevoiusWinNumber(address: string) {
    const publisher = process.env.Public_Key as `0x${string}`;
    const sdk = new SDK({ public: publicClient as any, wallet: walletClient });
    const schemaId = await sdk.streams.computeSchemaId(leaderboardSchema);
    const getData: any = await sdk.streams.getByKey(
      schemaId,
      publisher,
      padHex(address as `0x${string}`, { size: 32 })
    );
    return Number(getData[0][1].value.value);
  }

  async selectWinner() {
    const publisher = process.env.Public_Key as `0x${string}`;
    try {
      const contract = new Contract(
        process.env.Air_Hockey_CA,
        air_hockey_abi,
        this.wallet
      );
      const keys = Object.keys(this.players);
      const players = Object.values(this.players);
      const winner_score = Math.max(
        this.players[keys[0]].score || 0,
        this.players[keys[1]].score || 0
      );
      const winner = players.find((p) => p.score === winner_score);

      console.log(winner_score, winner.address);
      const prevWin = await this.getPrevoiusWinNumber(winner.address);
      console.log("previous win", prevWin || 0);
      const presentWin = prevWin + 1;
      await this.setLeadersboard(winner.address, presentWin);
      const select_winner_tx = await contract.select_winner(
        this.myRoom.tempRoomId,
        winner.address,
        { nonce: await this.provider.getTransactionCount(publisher, "pending") }
      );
      const select_winner_recipt = await select_winner_tx.wait();
      console.log("receipt log", select_winner_recipt);

      this.broadcast("winner_selected", {
        id: this.myRoom.tempRoomId,
        winner: winner.address,
      });
      this.clients.forEach((c) => {
        c.leave();
      });
    } catch (err) {
      console.log(err);
      //this.gameEnded = false;
      this.seconds = 3;
    }
  }
}
