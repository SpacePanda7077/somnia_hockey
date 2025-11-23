// scripts/publish-one.ts
import "dotenv/config";
import uniqid from "uniqid";
import { SDK, SchemaEncoder } from "@somnia-chain/streams";
import { publicClient, walletClient } from "../somnia/client";
import {
  chatSchema,
  customRoomSchema,
  leaderboardSchema,
} from "../somnia/schema";
import { parseEther, size, toHex, type Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { Room, Client, matchMaker } from "@colyseus/core";
import { Lobby_Room_State } from "./schema/LobbyRoomState";
import { air_hockey_abi } from "../somnia/air_hockey_abi";
import {
  Available_Lobbies,
  findMyRoom,
  findRoom,
} from "../Available_Lobbies/Available_Lobbies";
import { v4 as uuidv4 } from "uuid";
import { Waiting_Room } from "../classes/waiting_room/waiting_room";
import { queueTx } from "../globalTransaction/queueTx";

export class Lobby_Room extends Room<Lobby_Room_State> {
  maxClients = 20;
  state = new Lobby_Room_State();
  provider: JsonRpcProvider;
  wallet: Wallet;

  onCreate(options: any) {
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    // Quick Match implementation

    this.onMessage("create_quick_match", async (client: Client, id: string) => {
      console.log(id);
      const lobby = this.getMyRoom(id);
      if (!lobby) {
        console.log("lobby doesnt exist");
        return;
      }
      lobby.ready_clients.push(client);
      if (lobby.ready_clients.length >= 2) {
        const room = await matchMaker.createRoom("game_room", { id });
        lobby.ready_clients.forEach((c) => {
          c.send("start_quick_match", room.roomId);
          c.leave();
        });
      }
    });

    this.onMessage(
      "create_custom_room",
      async (client: Client, entry_fee: number) => {
        console.log("creating custom room");
        try {
          if (Available_Lobbies.length >= 20) return;
          const id = uniqid();
          const room = new Waiting_Room();
          room.tempRoomId = id;
          room.entry_fee = entry_fee;
          room.add_Player(client);
          Available_Lobbies.push(room);

          console.log("onchain lobby created");
          await queueTx(async () => {
            await this.create_custom_room(id, entry_fee);
          });

          //const game_room = await matchMaker.createRoom("game_room", { id });
          client.send("room_created", id);
        } catch (err) {
          console.log(err);
        }
      }
    );

    this.onMessage("join_custom_room", async (client: Client, id: string) => {
      const sdk = new SDK({
        public: publicClient as any,
        wallet: walletClient,
      });
      const schemaId = await sdk.streams.computeSchemaId(customRoomSchema);

      const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
      const custom_lobby = Available_Lobbies.find(
        (lobby) => lobby.tempRoomId === id
      );
      if (!custom_lobby || !isRegistered) {
        console.log("lobby doesnt exits or schema not registered");
      } else {
        custom_lobby.add_Player(client);
        if (custom_lobby.connected_clients.length >= 2) {
          //contract .....................................
          const contract = new Contract(
            process.env.Air_Hockey_CA,
            air_hockey_abi,
            this.wallet
          );
          // create onchain lobby ...............................
          await queueTx(async () => {
            const creat_lobby = await contract.create_lobby(
              id,
              parseEther(custom_lobby.entry_fee.toString()),
              []
            );
            await creat_lobby.wait();
          });

          custom_lobby.connected_clients.forEach((c) => {
            c.send("deposit_entryfee", {
              id: custom_lobby.tempRoomId,
              amount: custom_lobby.entry_fee,
            });
          });
        }
      }
    });

    // update available custom lobbies

    this.clock.setInterval(async () => {
      try {
        const rooms = await this.getAllcustomRoom();
        if (rooms) {
          // console.log(rooms);
          this.broadcast("available_custom_room", rooms);
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);
    this.clock.setInterval(async () => {
      try {
        const leaderboard = await this.getLeaderBoard();
        if (leaderboard) {
          // console.log(rooms);
          console.log(leaderboard);
          this.broadcast("leaderboard", leaderboard);
        }
      } catch (err) {
        console.log(err);
      }
    }, 30000);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined lobby room !! ");
  }

  async onLeave(client: Client, consented: boolean) {
    const room = findMyRoom(client);
    const sdk = new SDK({
      public: publicClient as any,
      wallet: walletClient,
    });
    const schemaId = await sdk.streams.computeSchemaId(customRoomSchema);
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
    if (!isRegistered) return;
    if (room && !room.inGame) {
      room.remove_Player(client);
      if (room.connected_clients.length <= 0) {
        const data = this.encodeOrDecodeSchema(
          room.tempRoomId,
          false,
          room.entry_fee
        );
        const setHash = await sdk.streams.set([
          { id: toHex(data.roomId, { size: 32 }), schemaId, data: data.data },
        ]);
        const receipt = await waitForTransactionReceipt(publicClient as any, {
          hash: setHash as `0x${string}`,
        });

        const index = Available_Lobbies.indexOf(room);
        Available_Lobbies.splice(index, 1);
      }
    }
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
  getMyRoom(id: string) {
    const room = Available_Lobbies.find((r) => r.tempRoomId === id);
    if (room) {
      return room;
    }
  }
  async create_custom_room(roomId: string, entry_fee: number) {
    const sdk = new SDK({ public: publicClient as any, wallet: walletClient });
    const schemaId = await sdk.streams.computeSchemaId(customRoomSchema);
    console.log(schemaId);
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
    if (isRegistered) {
      console.log("Schema already registered.");
      const data = this.encodeOrDecodeSchema(roomId, true, entry_fee);
      const setHash = await sdk.streams.set([
        { id: toHex(data.roomId, { size: 32 }), schemaId, data: data.data },
      ]);
      const receipt = await waitForTransactionReceipt(publicClient as any, {
        hash: setHash as `0x${string}`,
      });
      console.log(setHash);

      return;
    } else {
      const txHash = await sdk.streams.registerDataSchemas([
        { id: schemaId, schema: customRoomSchema },
      ]);

      console.log("Register tx:", txHash);

      const receipt = await waitForTransactionReceipt(publicClient as any, {
        hash: txHash as `0x${string}`,
      });
      console.log("Registered in block:", receipt.blockNumber);

      const data = this.encodeOrDecodeSchema(roomId, true, entry_fee);
      await sdk.streams.set([
        { id: toHex(data.roomId, { size: 32 }), schemaId, data: data.data },
      ]);
    }
  }
  encodeOrDecodeSchema(roomId: string, isOpen: boolean, entry_fee: number) {
    const encoder = new SchemaEncoder(customRoomSchema);
    const now = BigInt(Date.now());
    const data = encoder.encodeData([
      { name: "timestamp", value: now, type: "uint64" },
      { name: "roomId", value: roomId, type: "string" },
      { name: "isOpen", value: isOpen, type: "bool" },
      {
        name: "entry_fee",
        value: parseEther(entry_fee.toString()),
        type: "uint256",
      },
    ]);
    return { data, roomId };
  }
  async getAllcustomRoom() {
    const publisher = process.env.Public_Key as `0x${string}`;
    const sdk = new SDK({ public: publicClient as any });
    const schemaId = await sdk.streams.computeSchemaId(customRoomSchema);
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
    if (!isRegistered) return;
    const rows = await sdk.streams.getAllPublisherDataForSchema(
      schemaId,
      publisher
    );

    if (rows) {
      return rows.reverse();
    } else {
      console.log("no row");
    }
  }
  async getLeaderBoard() {
    const publisher = process.env.Public_Key as `0x${string}`;
    const sdk = new SDK({ public: publicClient as any });
    const schemaId = await sdk.streams.computeSchemaId(leaderboardSchema);
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
    if (!isRegistered) return;
    const rows = await sdk.streams.getAllPublisherDataForSchema(
      schemaId,
      publisher
    );

    if (rows) {
      return rows.reverse();
    } else {
      console.log("no row");
    }
  }
}
