import { SketchPicker } from "react-color";
import "./css/component.css";
import { useEffect, useState } from "react";
import { set_Network_Color } from "../network/network";
function Clor_Picker() {
    const [color, setColor] = useState("#ff0000");

    useEffect(() => {
        handleChange(color);
    }, [color]);
    function handleChange(newColor: any) {
        set_Network_Color(newColor);
        // You can also emit this color to the game scene if needed
    }

    return (
        <div className="color-picker-container">
            <div>Pick your color</div>
            <SketchPicker
                color={color}
                onChange={(updated) => setColor(updated.hex)}
            />
        </div>
    );
}
export default Clor_Picker;

