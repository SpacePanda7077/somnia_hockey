import { useEffect, useState } from "react";
import "./css/component.css";
import { EventBus } from "../game/EventBus";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { parseEther } from "viem";
import { getContract, prepareContractCall } from "thirdweb";
import { somniaTestnetCustomRPC } from "../somnia/chain";
import { client } from "../thirdWeb/thirdWeb";
import { CA } from "../somnia/somnia";

interface SceneProp {
    scene: Phaser.Scene | undefined;
}

function GameUi({ scene }: SceneProp) {
    const activeWallet = useActiveAccount();
    const [score, setScore] = useState([0, 0]);
    const [end_text, set_end_text] = useState("You Win");
    const [show_end_menu, set_show_end_menu] = useState(false);
    const [minute, set_minute] = useState(0);
    const [second, set_second] = useState(0);
    const [winner, set_winner] = useState(false);
    const [lobbyId, set_lobbyId] = useState("");

    useEffect(() => {
        const updateScoreHandler = (data: number[]) => {
            setScore(data);
        };

        const winnerHandler = (data: { id: string; winner: string }) => {
            set_lobbyId(data.id);
            set_show_end_menu(true);
            if (activeWallet?.address === data.winner) {
                set_end_text("You Win");
                set_winner(true);
            } else {
                set_end_text("You Lost");
                set_winner(false);
            }
        };

        const timerhandler = (data: { minute: number; second: number }) => {
            set_minute(data.minute);
            set_second(data.second);
        };

        EventBus.on("update_score", updateScoreHandler);
        EventBus.on("update_timer", timerhandler);
        EventBus.on("winner_selected", winnerHandler);

        return () => {
            EventBus.off("update_score", updateScoreHandler);
            EventBus.off("update_timer", timerhandler);
            EventBus.off("winner_selected", winnerHandler);
        };
    }, [activeWallet]);

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

    const handleClaimButtonClick = () => {
        if (!activeWallet) {
            console.error("Wallet not connected. Cannot send transaction.");
            // Optional: Notify the user in the UI/Game

            return; // Stop the function immediately
        }
        const transaction = prepareContractCall({
            contract,
            method: "function tranfer_winnings(string calldata _id , address _winner) public",
            params: [lobbyId, activeWallet.address],
        });
        sendTx(transaction);
    };
    useEffect(() => {
        if (isSuccess) {
            console.log("Winnings claimed successfully!");
            if (!scene) return;
            scene.scene.stop("Game");
            scene.scene.start("Menu");
        }
    }, [isSuccess]);

    return (
        <>
            <div className="score-container">
                <h1 className="player1">{score[0]}</h1>
                <h1 className="player2">{score[1]}</h1>
            </div>
            <div className="timer-container">
                <p>{minute}</p>
                <p>:</p>
                <p>{second}</p>
            </div>
            {show_end_menu && (
                <div className="end-menu-container">
                    <h1>{end_text}</h1>
                    <h3>
                        {score[0]} : {score[1]}
                    </h3>
                    <div className="button-container">
                        {winner && (
                            <button
                                onClick={handleClaimButtonClick}
                                className="claim-button"
                            >
                                Claim
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (!scene) return;
                                scene.scene.stop("Game");
                                scene.scene.start("Menu");
                            }}
                            className="main-menu-button"
                        >
                            Main Menu
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
export default GameUi;

