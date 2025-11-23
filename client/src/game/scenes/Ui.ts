import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { address } from "../../somnia/somnia";

export class Ui extends Scene {
    scoreTexts: Phaser.GameObjects.Text[];
    minute: Phaser.GameObjects.Text;
    seconds: Phaser.GameObjects.Text;
    endScreencontainer: Phaser.GameObjects.Container;
    winnerText: Phaser.GameObjects.Text;
    loseText: Phaser.GameObjects.Text;
    TieText: Phaser.GameObjects.Text;
    claim_button: Phaser.GameObjects.Container;
    menu_button: Phaser.GameObjects.Container;
    constructor() {
        super("Ui");
    }

    preload() {
        this.load.setPath("assets");
    }

    create() {
        const width = Number(this.game.config.width);
        const height = Number(this.game.config.height);
        const centerX = width / 2;
        const centerY = height / 2;
        this.scoreTexts = [];
        this.createScoreBoard(centerX, centerY);
        this.createTimer(centerX, centerY);
        this.createEndScreen(centerX, centerY);
        this.events.on("update_score", (data: number[]) => {
            console.log(data);
            data.forEach((score, index) => {
                this.scoreTexts[index].setText(data[index].toString());
            });
        });
        this.events.on(
            "update_timer",
            (data: { minute: number; second: number }) => {
                this.minute.setText(data.minute.toString());
                this.seconds.setText(data.second.toString());
            }
        );
        this.events.on("game-ended", (data: string) => {
            this.endScreencontainer.setActive(true).setVisible(true);
            if (address === data) {
                this.winnerText.setVisible(true);
                this.loseText.setVisible(false);
                this.claim_button.setActive(true).setVisible(true);
                this.menu_button.setActive(true).setVisible(true);
            } else {
                this.winnerText.setVisible(false);
                this.loseText.setVisible(true);
                this.claim_button.setActive(false).setVisible(false);
                this.menu_button.setActive(true).setVisible(true);
            }
        });

        EventBus.emit("current-scene-ready", this);
    }
    createScoreBoard(centerX: number, centerY: number) {
        for (let i = -1; i <= 1; i += 2) {
            const text = this.add
                .text(centerX + i * 100, centerY - 800, "0")
                .setScale(5)
                .setOrigin(0.5);
            this.scoreTexts.push(text);
        }
    }
    createTimer(centerX: number, centerY: number) {
        this.minute = this.add
            .text(centerX + -1 * 100, centerY + 800, "2")
            .setScale(5)
            .setOrigin(0.5);
        this.add
            .text(centerX + 0 * 100, centerY + 800, ":")
            .setScale(5)
            .setOrigin(0.5);
        this.seconds = this.add
            .text(centerX + 1 * 100, centerY + 800, "30")
            .setScale(5)
            .setOrigin(0.5);
    }

    createEndScreen(centerX: number, centerY: number) {
        const width = Number(this.game.config.width);
        const height = Number(this.game.config.height);
        this.endScreencontainer = this.add.container(centerX, centerY);
        const bg = this.add.rectangle(
            0,
            0,
            0.5 * width,
            0.8 * height,
            0x000000,
            0.7
        );
        this.winnerText = this.add
            .text(0, 0, "You won !!!", { font: "bold 32px Arial" })
            .setOrigin(0.5)
            .setScale(4);
        this.loseText = this.add
            .text(0, 0, "You Lost !!!", { font: "bold 32px Arial" })
            .setOrigin(0.5)
            .setScale(4);

        this.claim_button = this.add.container(0, 100);
        const claimbtn = this.add
            .rectangle(0, 100, 0.2 * width, 100, 0x00ff00)
            .setInteractive()
            .on("pointerdown", () => {
                EventBus.emit("claim_winnings");
            });
        const claimbtntext = this.add
            .text(0, 100, "Claim", {
                font: "bold 80px Arial",
            })
            .setOrigin(0.5);
        this.claim_button.add([claimbtn, claimbtntext]);
        this.menu_button = this.add.container(0, 100);
        const menubtn = this.add
            .rectangle(0, 200, 0.2 * width, 100, 0xff0000)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.get("Game").scene.stop();
                this.scene.start("Menu");
            });
        const menubtntext = this.add
            .text(0, 200, "Main Menu", {
                font: "bold 80px Arial",
            })
            .setOrigin(0.5);
        this.menu_button.add([menubtn, menubtntext]);
        this.endScreencontainer
            .add([
                bg,
                this.winnerText,
                this.loseText,
                this.claim_button,
                this.menu_button,
            ])
            .setActive(false)
            .setVisible(false);
    }
}

