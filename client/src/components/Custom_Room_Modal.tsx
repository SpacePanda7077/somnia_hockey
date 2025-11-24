import { useEffect, useState } from "react";
import "./css/component.css";
import { EventBus } from "../game/EventBus";
import { useActiveAccount } from "thirdweb/react";
import Waiting_Modal from "./Waiting_Modal";

interface OpenModalProp {
    openModal: boolean;
    setOpen: () => void;
}
function Custom_Room_modal({ openModal, setOpen }: OpenModalProp) {
    const activeWallet = useActiveAccount();
    const [entryFee, setEntryFee] = useState(0);

    const [isWaitModalOpen, setWaitModalOpen] = useState(false);
    const [createRoomText, setCreateRoomText] = useState("Creating Room !!!");

    const setWaitOpen = (open: boolean) => {
        setWaitModalOpen(open);
    };
    const setText = (message: string) => {
        setCreateRoomText(message);
    };

    useEffect(() => {
        EventBus.on("room_created", () => {
            setText("Room created, Waiting for other players");
        });
    }, []);

    const handle_click = () => {
        if (!activeWallet) return;
        setWaitOpen(true);
        //if (entryFee < 0.01) return;
        EventBus.emit("create_custom_lobby", entryFee);
        console.log("clicked...");

        setEntryFee(0);
        setOpen();
    };

    return (
        <>
            {openModal && (
                <div className="custom-modal-container">
                    <h2>Create a Custom Match</h2>
                    <input
                        type="text"
                        placeholder="set fee amount"
                        onChange={(e) => {
                            setEntryFee(Number(e.target.value));
                        }}
                    />
                    <div className="modal-button">
                        <button onClick={handle_click}>Create_Lobby</button>
                        <button
                            onClick={() => {
                                setOpen();
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <Waiting_Modal
                isOpen={isWaitModalOpen}
                setOpen={setWaitOpen}
                text={createRoomText}
                setText={setText}
            />
        </>
    );
}
export default Custom_Room_modal;

