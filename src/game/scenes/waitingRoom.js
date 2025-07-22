import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import Character from "../character.js";
import TextArea from "../../framework/UI/textArea.js";

export default class waitingRoom extends LaEntrevistaBaseScene {
    /**
    * Escena de la sala de espera
    * @extends LaEntrevistaBaseScene
    */
    constructor() {
        super("WaitingRoom");
    }

    create() {
        super.create();

        let bg = this.add.image(0, 0, "waitingRoom").setOrigin(0, 0);
        let nodes = this.cache.json.get("waitingRoom");
        let namespace = "scenes\\waitingRoom";

        let arrowScale = 0.5;
        let corridorArrow = this.add.image(100, 540, "uiElements", "sideArrow").setOrigin(0.5, 0.5).setScale(arrowScale).setAngle(-90);
        let doorArrow = this.add.image(1100, 660, "uiElements", "frontArrow").setOrigin(0.5, 0.5).setScale(arrowScale);
        doorArrow.setVisible(false);
        this.tweens.add({
            targets: [corridorArrow, doorArrow],
            scale: { from: arrowScale, to: arrowScale * 1.2 },
            duration: 1000,
            repeat: -1,
            yoyo: true
        });


        let corridor = this.add.zone(0, 0, 160, this.CANVAS_HEIGHT).setOrigin(0, 0);
        this.setInteractive(corridor);
        corridor.on("pointerdown", () => {
            this.gameManager.startCorridorScene();
        });

        // Puerta
        let doorNode = this.localizationManager.readNodes(this, nodes, namespace, "door");

        let door = this.add.zone(1097, 430, 140, 470).setOrigin(0.5, 0.5);
        this.setInteractive(door);
        door.on("pointerdown", () => {
            // TRACKER EVENT
            this.trackerManager.sendInteractHRDoor("closed");

            this.localizationManager.setNode(doorNode);
        });


        this.dispatcher.add("allPeopleInteracted", this, () => {
            doorArrow.setVisible(true);
            this.tweens.add({
                targets: [doorArrow],
                scale: { from: arrowScale, to: arrowScale * 1.2 },
                duration: 1000,
                repeat: -1,
                yoyo: true
            });

            door.on("pointerdown", () => {
                let anim = this.tweens.add({
                    targets: [corridorArrow, doorArrow],
                    alpha: { from: 1, to: 0 },
                    duration: 200,
                    repeat: 0
                });
                anim.on("complete", () => {
                    corridorArrow.setVisible(false);
                    doorArrow.setVisible(false);
                });
                // TRACKER EVENT
                this.trackerManager.sendInteractHRDoor("open");

                this.gameManager.progressGame();

                this.gameManager.startOfficeScene();
            });

            doorNode = null;
        });

        let textArea = new TextArea(this, 1227, 280, 95, 60, this.localizationManager.translate("humanResourcesSign", "scenes"), this.SIGN_TEXT_CONFIG);
        textArea.adjustFontSize();

        // Jaime
        let jaimeExitPoint = new Phaser.Math.Vector2(-100, 530);

        let jaimeNode = this.localizationManager.readNodes(this, nodes, namespace, "JaimeConversation");
        let jaimeConfig = {
            x: 439,
            scale: 0.9
        }
        let jaimeChar = new Character(this, jaimeConfig.x, jaimeExitPoint.y, jaimeConfig.scale, "Jaime",
            this.characterConfig.speed, true, () => {
                this.localizationManager.setNode(jaimeNode);
            });

        this.dispatcher.addOnce("JaimeLeave", this, () => {
            jaimeChar.setScale(jaimeChar.scale * 0.80);
            this.leaveRoom([jaimeChar], jaimeExitPoint);
        })

        // Antonio
        let antonioExitPoint = new Phaser.Math.Vector2(-100, 542);

        let antonioNode = this.localizationManager.readNodes(this, nodes, namespace, "AntonioConversation");
        let antonioConfig = {
            x: 706,
            scale: 0.85
        }
        let antonioChar = new Character(this, antonioConfig.x, antonioExitPoint.y, antonioConfig.scale, "Antonio",
            this.characterConfig.speed, false, () => {
                this.localizationManager.setNode(antonioNode);
            });

        this.dispatcher.addOnce("AntonioLeave", this, () => {
            antonioChar.setScale(antonioChar.scale * 0.68);
            this.leaveRoom([antonioChar], antonioExitPoint);
        })
    }
}