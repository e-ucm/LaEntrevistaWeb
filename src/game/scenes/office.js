import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import Character from "../character.js";

import { GameStageWithErrors } from "../gameStage.js";

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

        this.questionsOffice = new GameStageWithErrors("questionsOffice", 12, this.blackboard);

        let bg = this.add.image(0, 0, "office").setOrigin(0, 0);

        this.nodes = this.cache.json.get("office");
        let namespace = "scenes\\office";

        let node = this.dialogManager.readNodes(this, this.nodes, namespace, "");

        let andresChar = new Character(this, 540, 710, 1, "Andres", this.characterConfig.speed, false, () => {
            // TRACKER EVENT
            this.questionsOffice.initialize();

            this.dialogManager.setNode(node);
        });
        andresChar.setOrigin(0.5, 0.5);

        let luisaChar = new Character(this, 1125, 650, 1, "Luisa", this.characterConfig.speed, false, () => {
            // TRACKER EVENT
            this.questionsOffice.initialize();

            this.dialogManager.setNode(node);
        });
        luisaChar.setOrigin(0.5, 0.5);

        this.add.image(0, 0, "desk").setOrigin(0, 0);

        this.blackboard.set("errors", 0);
        this.dispatcher.add("wrongAnswer", this, () => {
            let errors = this.blackboard.get("errors");
            this.blackboard.set("errors", errors + 1);

            // console.log(errors + 1);
        });

        this.dispatcher.add("changeTopic", this, () => {
            // TRACKER EVENT
            this.questionsOffice.progress();
        });

        this.dispatcher.add("hired", this, () => {
            // TRACKER EVENT
            this.questionsOffice.progress();
            this.questionsOffice.complete(true, true, { "end": "hired" });
        });

        this.dispatcher.add("doubt", this, () => {
            // TRACKER EVENT
            this.questionsOffice.progress();
            this.questionsOffice.complete(false, true, { "end": "doubt" });
        });

        this.dispatcher.add("notHired", this, () => {
            // TRACKER EVENT
            this.questionsOffice.progress();
            this.questionsOffice.complete(false, true, { "end": "notHired" });
        });

        this.dispatcher.add("exit", this, () => {
            this.gameManager.startWaitingRoomScene();
        });

        this.dispatcher.add("end", this, () => {
            // TRACKER EVENT
            this.gameManager.increaseGameProgress();

            this.gameManager.startMirrorScene(false);
        });
    }
}