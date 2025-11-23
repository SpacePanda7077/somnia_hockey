import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import {
    ConnectButton,
    useActiveAccount,
    useSendTransaction,
} from "thirdweb/react";
import { somniaTestnetCustomRPC } from "./somnia/chain";
import Custom_Rooms from "./components/Custom_Rooms";
import Custom_Room_modal from "./components/Custom_Room_Modal";
import { EventBus } from "./game/EventBus";
import { getContract, prepareContractCall } from "thirdweb";
import { CA, setAddress } from "./somnia/somnia";
import { parseEther } from "viem";
import { client } from "./thirdWeb/thirdWeb";
import Waiting_Modal from "./components/Waiting_Modal";
import { Scene } from "phaser";
import Menu from "./components/Menu";
import GameUi from "./components/GameUi";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    // const secretKey =
    //     "LH7HG7Pjd2fq19z1dEK58F9rZkrkL-b2CjnjXQRJZR7h6WnuCf4hdCpTV9AdQXH2G65PLRPF8136OtIx2sGzpQ";

    const activeWallet = useActiveAccount();

    const [roomId, setRoomId] = useState("");
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [current_scene, set_current_scene] = useState<Phaser.Scene>();

    const contract = getContract({
        address: CA,
        chain: somniaTestnetCustomRPC,
        client,
    });

    const {
        mutate: sendTx,
        data: transactionResult,
        error,
        isSuccess,
    } = useSendTransaction();

    const make_payment = (data: { id: string; amount: number }) => {
        if (!activeWallet) {
            console.error("Wallet not connected. Cannot send transaction.");
            // Optional: Notify the user in the UI/Game

            return; // Stop the function immediately
        }
        const transaction = prepareContractCall({
            contract,
            method: "function enter_lobby(string calldata _id) public payable",
            params: [data.id],
            value: parseEther(data.amount.toString()),
        });
        sendTx(transaction);
    };

    useEffect(() => {
        const handlePayment = (data: { id: string; amount: number }) => {
            setRoomId(data.id);
            console.log("making paymants");
            make_payment({ id: data.id, amount: data.amount });
        };

        EventBus.on("make_payment", handlePayment);

        // Clean-up function to remove the listener when the component unmounts
        return () => {
            EventBus.off("make_payment");
        };
    }, [roomId, make_payment]);
    useEffect(() => {
        if (isSuccess) {
            EventBus.emit("entryfee_paid", roomId);
            EventBus.off("entryfee_paid");
        }
    }, [isSuccess]);
    useEffect(() => {
        console.log(error);
    }, [error]);
    useEffect(() => {
        if (activeWallet) {
            setAddress(activeWallet.address);
        }
    }, [activeWallet]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (scene: Phaser.Scene) => {
            set_current_scene(scene);
        });
        EventBus.on("claim_winnings", () => {});
    }, []);

    return (
        <div id="app">
            <div style={{ position: "absolute", top: "0%", left: "0%" }}>
                <ConnectButton client={client} chain={somniaTestnetCustomRPC} />
                ;
            </div>

            <PhaserGame ref={phaserRef} />
            {current_scene?.scene.key === "Menu" && (
                <>
                    <Menu />
                </>
            )}
            {current_scene?.scene.key === "Game" && (
                <>
                    <GameUi scene={current_scene} />
                </>
            )}
        </div>
    );
}

export default App;

