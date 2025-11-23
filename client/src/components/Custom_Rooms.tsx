import { useEffect, useState } from "react";
import "./css/component.css";
import { EventBus } from "../game/EventBus";
import { formatEther } from "viem";

interface OpenModalProp {
    openModal: boolean;
    setOpen: () => void;
}

function Custom_Rooms({ openModal, setOpen }: OpenModalProp) {
    const [available_rooms, set_available_room] = useState<
        { roomId: string; isOpened: boolean; entryFee: bigint }[]
    >([]);

    useEffect(() => {
        EventBus.on(
            "available_room",
            (
                data: { roomId: string; isOpened: boolean; entryFee: bigint }[]
            ) => {
                set_available_room(data);
            }
        );
    }, []);
    const handleclick = (id: string) => {
        EventBus.emit("join_custom_room", id);
    };
    return (
        <>
            {openModal && (
                <div className="custom-room-container">
                    <h1>Available Custom Rooms</h1>
                    <div className="room-container">
                        {available_rooms.map((rooms) => (
                            <div key={rooms.roomId} className="room-content">
                                <p>room id : {rooms.roomId}</p>
                                <p>
                                    Entry Fee : {formatEther(rooms.entryFee)}{" "}
                                    $Somi
                                </p>
                                <button
                                    onClick={() => {
                                        handleclick(rooms.roomId);
                                    }}
                                    style={{
                                        backgroundColor: rooms.isOpened
                                            ? "green"
                                            : "red",

                                        border: "solid",
                                        borderRadius: "10px",
                                        color: "white",
                                    }}
                                >
                                    {rooms.isOpened ? "JOIN" : "CLOSED"}
                                </button>
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
export default Custom_Rooms;

