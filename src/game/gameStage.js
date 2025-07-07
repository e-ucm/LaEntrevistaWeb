import xApiTracker from "../lib/xApiTracker.js";

export class GameStage {
    constructor(id, nRequired) {
        this.id = id;
        this.type = JSTracker.COMPLETABLETYPE.STAGE;

        this.nCompleted = 0;
        this.nRequired = nRequired;
    }

    initialize() {
        this.reset();
        xApiTracker.completableTracker.Initialized(this.id, this.type);
    }

    progress(increase = 1, extensions = {}) {
        this.nCompleted += increase;

        let progress = this.nCompleted / this.nRequired
        xApiTracker.completableTracker.Progressed(this.id, this.type, progress)
            .withScoreRaw(this.nCompleted)
            .withScoreMax(this.nRequired)
            .withProgress(progress)
            .apply(statement => statement.addResultExtensions(extensions));
    }

    hasCompleted() {
        return this.nCompleted >= this.nRequired;
    }

    complete(success, completion, extensions = {}) {
        this.nCompleted = this.nRequired;
        xApiTracker.completableTracker.Completed(this.id, this.type, success, completion, 1)
            .apply(statement => statement.addResultExtensions(extensions));
        this.reset();
    }

    reset() {
        this.nCompleted = 0;
    }
}

export class GameStageWithErrors extends GameStage {
    constructor(id, nRequired, blackboard) {
        super(id, nRequired);

        this.blackboard = blackboard;
        this.errorsKey = "errors";
    }

    progress(increase = 1, extensions = {}) {
        if (this.blackboard.has(this.errorsKey)) {
            extensions[this.errorsKey] = this.blackboard.get(this.errorsKey);
        }
        super.progress(increase, extensions);
    }

    complete(success, completion, extensions = {}) {
        if (this.blackboard.has(this.errorsKey)) {
            extensions[this.errorsKey] = this.blackboard.get(this.errorsKey);
        }
        super.complete(success, completion, extensions);
    }
}