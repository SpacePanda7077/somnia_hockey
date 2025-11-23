import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import your Room files
 */
import { Game_Room } from "./rooms/Game_Room";

import { Lobby_Room } from "./rooms/Lobby_Room";
import { SchemaEncoder, SDK } from "@somnia-chain/streams";
import { publicClient, walletClient } from "./somnia/client";
import { seasonSchema } from "./somnia/schema";
import { toHex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("lobby_room", Lobby_Room);
    gameServer.define("game_room", Game_Room);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    app.post("/update_season", async (req, res) => {
      const publisher = process.env.Public_Key as `0x${string}`;
      const sdk = new SDK({
        public: publicClient as any,
        wallet: walletClient,
      });
      const schemaId = await sdk.streams.computeSchemaId(seasonSchema);
      const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId);
      if (!isRegistered) {
        const txHash = await sdk.streams.registerDataSchemas([
          { id: schemaId, schema: seasonSchema },
        ]);
        console.log("Register tx:", txHash);

        const txreceipt = await waitForTransactionReceipt(publicClient as any, {
          hash: txHash as `0x${string}`,
        });
        console.log("Registered in block:", txreceipt.blockNumber);

        const data = encodeSeasonScheme(1);
        const setHash = await sdk.streams.set([
          {
            id: toHex("season", { size: 32 }),
            schemaId,
            data: data,
          },
        ]);
        const receipt = await waitForTransactionReceipt(publicClient as any, {
          hash: setHash as `0x${string}`,
        });
        console.log(setHash);
      } else {
        const season = await sdk.streams.getAllPublisherDataForSchema(
          schemaId,
          publisher
        );
        console.log(season);
      }
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
function encodeSeasonScheme(season: number) {
  const encoder = new SchemaEncoder(seasonSchema);
  const data = encoder.encodeData([
    { name: "season", value: season, type: "uint256" },
  ]);
  return data;
}
