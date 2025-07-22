import LaEntrevistaBaseScene from "../../laEntrevistaBaseScene.js";

export default class QuestionBaseScene extends LaEntrevistaBaseScene {
    constructor(name) {
        super(name);
    }

    create(params) {
        super.create(params);

        this.nodes = this.cache.json.get("questions");
        this.namespace = "scenes\\questions";
        this.node = this.localizationManager.readNodes(this, this.nodes, this.namespace, "question" + params.number);

        this.dispatcher.add("endQuestion", this, () => {
            this.gameManager.startMirrorScene(params.fromMenu);
        });
    }

    onCreate() {
        setTimeout(() => {
            this.localizationManager.setNode(this.node);
        }, 200);
    }
}