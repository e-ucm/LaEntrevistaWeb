import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import Character from "../character.js";

export default class Hall extends LaEntrevistaBaseScene {
    /**
    * Escena de la recepcion
    * @extends LaEntrevistaBaseScene
    */
    constructor() {
        super("Hall");
    }

    create() {
        super.create();

        let bg = this.add.image(0, 0, "hall").setOrigin(0, 0);

        this.nodes = this.cache.json.get("hall");
        let namespace = "scenes\\hall";

        let node = this.localizationManager.readNodes(this, this.nodes, namespace, "start");

        let ivanChar = new Character(this, 810, 525, 0.33, "Ivan", this.characterConfig.speed, false, () => {
            this.localizationManager.setNode(node);
        });
        ivanChar.setOrigin(0.5, 0.5);

        this.add.image(0, 0, "counter").setOrigin(0, 0);


        this.dispatcher.add("point", this, () => {
            ivanChar.playAnimation(ivanChar.types.pointing);
            ivanChar.setDialogAnimations(false);
            ivanChar.once("animationcomplete", () => {
                ivanChar.playDefaultAnimation();
                ivanChar.setDialogAnimations(true);
            });
        });

        this.dispatcher.add("end", this, () => {
            node = this.localizationManager.readNodes(this, this.nodes, namespace, "repeat");

            let stairs = this.add.zone(1350, 453, 500, 660);
            this.setInteractive(stairs);
            stairs.on("pointerdown", () => {
                stairs.disableInteractive();

                // TRACKER EVENT
                this.gameManager.charactersStage.initialize();

                this.gameManager.startCorridorScene();
            });

            let arrowScale = 0.6;
            let arrow = this.add.image(1383, 699, "uiElements", "frontArrow").setOrigin(0.5, 0.5).setScale(arrowScale);

            this.tweens.add({
                targets: arrow,
                alpha: { from: 0, to: 1 },
                duration: 200,
                repeat: 0
            });

            this.tweens.add({
                targets: arrow,
                scale: { from: arrowScale, to: arrowScale * 1.2 },
                duration: 1000,
                repeat: -1,
                yoyo: true
            });
        });

    }
}