import { useEffect, useState } from "react";
import { EventBus } from "../game/EventBus";

function Waiting_Modal() {
    const [roomCreated, setRoomCreated] = useState(false);
    useEffect(() => {
        EventBus.on("room_created", () => {
            setRoomCreated(true);
        });
    }, []);
    return (
        <>
            {roomCreated && (
                <div className="waiting-modal">
                    <h1>Waiting for other player</h1>
                    <button
                        onClick={() => {
                            setRoomCreated(false);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </>
    );
}
export default Waiting_Modal;

