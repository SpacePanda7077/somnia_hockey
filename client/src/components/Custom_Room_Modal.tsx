import { useState } from "react";
import "./css/component.css";
import { EventBus } from "../game/EventBus";
import { useActiveAccount } from "thirdweb/react";

interface OpenModalProp {
    openModal: boolean;
    setOpen: () => void;
}
function Custom_Room_modal({ openModal, setOpen }: OpenModalProp) {
    const activeWallet = useActiveAccount();
    const [entryFee, setEntryFee] = useState(0);

    const handle_click = () => {
        if (!activeWallet) return;
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
        </>
    );
}
export default Custom_Room_modal;

