import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import Character from "../character.js";
import GameStage from "../gameStage.js";

export default class Office extends LaEntrevistaBaseScene {
    /**
    * Escena de la oficina
    * @extends LaEntrevistaBaseScene
    */
    constructor() {
        super("Office");
    }

    create() {
        super.create();

        this.officeStage = new GameStage("officeQuestions", 12);

        let bg = this.add.image(0, 0, "office").setOrigin(0, 0);

        this.nodes = this.cache.json.get("office");
        let namespace = "scenes\\office";

        let node = this.localizationManager.readNodes(this, this.nodes, namespace, "");

        let andresChar = new Character(this, 540, 710, 1, "Andres", this.characterConfig.speed, false, () => {
            // TRACKER EVENT
            this.officeStage.initialize();

            this.localizationManager.setNode(node);
        });
        andresChar.setOrigin(0.5, 0.5);

        let luisaChar = new Character(this, 1125, 650, 1, "Luisa", this.characterConfig.speed, false, () => {
            // TRACKER EVENT
            this.officeStage.initialize();

            this.localizationManager.setNode(node);
        });
        luisaChar.setOrigin(0.5, 0.5);

        this.add.image(0, 0, "desk").setOrigin(0, 0);

        this.blackboard.set("errors", 0);
        this.dispatcher.add("wrongAnswer", this, () => {
            let errors = this.blackboard.get("errors");
            this.blackboard.set("errors", errors + 1);

            // console.log(errors + 1);
        });

        let sendCompleteOffice = (end) => {
            this.officeStage.progress(this.blackboard.get("errors"));
            this.officeStage.complete(true, true, { "end": end });
        }

        this.dispatcher.add("changeTopic", this, () => {
            // TRACKER EVENT
            this.officeStage.progress(this.blackboard.get("errors"));
        });

        this.dispatcher.add("hired", this, () => {
            // TRACKER EVENT
            sendCompleteOffice("hired");
        });

        this.dispatcher.add("doubt", this, () => {
            // TRACKER EVENT
            sendCompleteOffice("doubt");
        });

        this.dispatcher.add("notHired", this, () => {
            // TRACKER EVENT
            sendCompleteOffice("notHired");
        });

        this.dispatcher.add("exit", this, () => {
            this.gameManager.startWaitingRoomScene();
        });

        this.dispatcher.add("end", this, () => {
            // TRACKER EVENT
            this.gameManager.progressGame();

            this.gameManager.startMirrorScene(false);
        });
    }
}