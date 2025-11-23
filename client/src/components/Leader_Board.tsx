import { useEffect, useState } from "react";
import "./css/component.css";
import { EventBus } from "../game/EventBus";
import { formatEther } from "viem";

interface OpenModalProp {
    openModal: boolean;
    setOpen: () => void;
}

function Leader_Board({ openModal, setOpen }: OpenModalProp) {
    const [leaderboard, set_leaderboard] = useState<
        { address: string; wins: number }[]
    >([]);

    useEffect(() => {
        EventBus.on(
            "leaderboard_data",
            (data: { address: string; wins: number }[]) => {
                set_leaderboard(data);
            }
        );
    }, []);

    return (
        <>
            {openModal && (
                <div className="custom-room-container">
                    <h1>LeaderBoard</h1>
                    <div className="room-container">
                        {leaderboard.map((player, index) => (
                            <div
                                key={player.address}
                                className="leaderboard-content"
                            >
                                <p>Address : {player.address}</p>
                                <p>Wins : {player.wins} </p>
                                <p>position : {index + 1} </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setOpen();
                        }}
                    >
                        close
                    </button>
                </div>
            )}
        </>
    );
}
export default Leader_Board;

