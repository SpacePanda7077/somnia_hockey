import { Menu as MenuScene } from "./scenes/Menu";
import { Physics } from "./scenes/Physics";
import { Game as MainGame } from "./scenes/Game";
import { Ui as Ui_scene } from "./scenes/Ui";
import { AUTO, Game, Types } from "phaser";
import GlowFilterPostFx from "phaser3-rex-plugins/plugins/glowfilterpipeline";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilterpipeline-plugin";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 32 * 120,
    height: 32 * 60,
    parent: "game-container",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#2a2a2aff",
    scene: [MenuScene, Physics, MainGame, Ui_scene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

