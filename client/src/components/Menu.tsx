import { useState } from "react";
import Custom_Room_modal from "./Custom_Room_Modal";
import Custom_Rooms from "./Custom_Rooms";
import Waiting_Modal from "./Waiting_Modal";
import "./css/component.css";
import Color_Picker from "./Color_Picker";
import Leader_Board from "./Leader_Board";

function Menu() {
    const [create_match_modal_open, set_create_match_modal_open] =
        useState(false);
    const [find_match_modal_open, set_find_match_modal_open] = useState(false);
    const [leaderboard_modal_open, set_leaderboard_modal_open] =
        useState(false);

    const set_open_create_match_modal = () => {
        set_create_match_modal_open((prev) => !prev);
    };
    const set_open_find_match_modal = () => {
        set_find_match_modal_open((prev) => !prev);
    };
    const set_open_leaderboard_modal = () => {
        set_leaderboard_modal_open((prev) => !prev);
    };
    return (
        <>
            <Color_Picker />
            <div className="menu-container">
                <button
                    onClick={() => {
                        set_create_match_modal_open(true);
                    }}
                >
                    Create Match
                </button>
                <button
                    onClick={() => {
                        set_find_match_modal_open(true);
                    }}
                >
                    Find Match
                </button>
                <button
                    onClick={() => {
                        set_leaderboard_modal_open(true);
                    }}
                >
                    LeaderBoard
                </button>
            </div>
            <Custom_Room_modal
                openModal={create_match_modal_open}
                setOpen={set_open_create_match_modal}
            />
            <Custom_Rooms
                openModal={find_match_modal_open}
                setOpen={set_open_find_match_modal}
            />
            <Leader_Board
                openModal={leaderboard_modal_open}
                setOpen={set_open_leaderboard_modal}
            />
        </>
    );
}
export default Menu;

