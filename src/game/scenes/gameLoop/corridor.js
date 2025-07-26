import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import Character from "../character.js";
import TextArea from "../../../framework/UI/textArea.js";
import InteractiveContainer from "../../../framework/UI/interactiveContainer.js";

export default class Corridor extends LaEntrevistaBaseScene {
    /**
    * Escena del pasillo
    * @extends LaEntrevistaBaseScene
    */
    constructor() {
        super("Corridor");
    }

    create() {
        super.create();

        let bg = this.add.image(0, 0, "corridor").setOrigin(0, 0);

        this.nodes = this.cache.json.get("corridor");
        this.namespace = "scenes\\corridor";

        let locationNode = this.localizationManager.readNodes(this, this.nodes, this.namespace, "locationInquiry");

        let signs = [
            {
                y: 216,
                id: "meetingRoomSign"
            },
            {
                y: 333,
                id: "cafeteriaSign"
            }
        ];

        signs.forEach(({ y, id }) => {
            this.createSign(393, y, 410, 105, this.localizationManager.translate(id, "scenes"), 43, 20, id);
        });

        // Luis
        let exitPoint = new Phaser.Math.Vector2(-100, 650);

        let luisChar = new Character(this, 1200, exitPoint.y, 1.5, "Luis", this.characterConfig.speed, false, null);
        luisChar.setOrigin(0.5, 0.5);
        this.dispatcher.addOnce("leaveRoom", this, () => {
            this.leaveRoom([luisChar], exitPoint);
        });

        luisChar.once("targetReached", () => {
            let arrowScale = 0.5;
            let waitingRoomArrow = this.add.image(946, 658, "uiElements", "frontArrow").setOrigin(0.5, 0.5).setScale(arrowScale);
            let cafeteriaArrow = this.add.image(100, 540, "uiElements", "sideArrow").setOrigin(0.5, 0.5).setScale(arrowScale).setAngle(-90);

            this.tweens.add({
                targets: [waitingRoomArrow, cafeteriaArrow],
                alpha: { from: 0, to: 1 },
                duration: 200,
                repeat: 0
            });

            this.tweens.add({
                targets: [waitingRoomArrow, cafeteriaArrow],
                scale: { from: arrowScale, to: arrowScale * 1.2 },
                duration: 1000,
                repeat: -1,
                yoyo: true
            });
        })

        setTimeout(() => {
            this.localizationManager.setNode(locationNode);

            let cafeteria = this.add.zone(0, 0, 160, this.CANVAS_HEIGHT).setOrigin(0, 0);
            this.setInteractive(cafeteria);
            cafeteria.on("pointerdown", () => {
                this.gameManager.startCafeteriaScene();
            });

            let waitingRoom = this.add.zone(955, 475, 240, 470);
            this.setInteractive(waitingRoom);
            waitingRoom.on("pointerdown", () => {
                this.gameManager.startWaitingRoomScene();
            });
        }, 200);
    }

    createSign(x, y, width, height, text, textLeftMargin, textRightMargin, id) {
        let container = new InteractiveContainer(this, 0, 0);
        let rect = this.add.zone(0, 0, width, height).setOrigin(0.5, 0.5);
        let textArea = new TextArea(this, width / 2 - textRightMargin, 0, width, height, text, this.SIGN_TEXT_CONFIG, 1, 0.5, (textLeftMargin + textRightMargin) / 2);
        textArea.adjustFontSize();

        container.add(rect);
        container.add(textArea);
        container.calculateRectangleSize();

        container.setPosition(x, y);
        this.setInteractive(container);

        let node = this.localizationManager.readNodes(this, this.nodes, this.namespace, id);
        container.on("pointerdown", () => {
            // TRACKER EVENT
            this.trackerManager.sendInteractGameObject(id);

            this.localizationManager.setNode(node);
        });
    }
}