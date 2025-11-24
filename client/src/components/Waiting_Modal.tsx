import { useEffect, useState } from "react";
import { EventBus } from "../game/EventBus";
interface OpenModalProp {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    text: string;
    setText: (message: string) => void;
}
function Waiting_Modal({ isOpen, setOpen, text, setText }: OpenModalProp) {
    return (
        <>
            {isOpen && (
                <div className="waiting-modal">
                    <h1>{text}</h1>
                    <button
                        onClick={() => {
                            setOpen(false);
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

