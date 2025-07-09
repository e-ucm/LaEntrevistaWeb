import xApiTracker from "../framework/lib/xApiTracker.js";

export class GameStage {
    /**
    * Clase base que representa una etapa del juego que puede ser completada
    * @param {String} id - identificador de la etapa
    * @param {Number} nRequired - numero de progresos para completar la etapa
    */
    constructor(id, nRequired) {
        this.id = id;
        this.type = JSTracker.COMPLETABLETYPE.STAGE;

        this.nCompleted = 0;
        this.nRequired = nRequired;
    }

    // Inicializar la etapa
    initialize() {
        this.reset();
        xApiTracker.completableTracker.Initialized(this.id, this.type);
    }

    /**
    * Incrementar el progreso de la etapa
    * @param {Number} increase - cuanto aumentar el progreso (opcional)
    * @param {Object} extensions - extensiones para la declaracion xApi
    */
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

    /**
    * Marcar la etapa como completada
    * @param {Boolean} success - indicar si se completo exitosamente (true) o no (false)
    * @param {Boolean} completion - indicar si se completo (true) o no (false), por ejemplo, si hay que repetirla
    * @param {Object} extensions - extensiones para la declaracion xApi
    */
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
    /**
    * Subclase que tambien rastrea errores
    * @param {String} id - identificador de la etapa
    * @param {Number} nRequired - numero de progresos para completar la etapa
    * @param {*} blackboard - objeto que contiene los errores
    */
    constructor(id, nRequired, blackboard) {
        super(id, nRequired);

        this.blackboard = blackboard;
        this.errorsKey = "errors";
    }

    progress(increase = 1, extensions = {}) {
        extensions[this.errorsKey] = 0;
        if (this.blackboard.has(this.errorsKey)) {
            extensions[this.errorsKey] = this.blackboard.get(this.errorsKey);
        }
        super.progress(increase, extensions);
    }

    complete(success, completion, extensions = {}) {
        extensions[this.errorsKey] = 0;
        if (this.blackboard.has(this.errorsKey)) {
            extensions[this.errorsKey] = this.blackboard.get(this.errorsKey);
        }
        super.complete(success, completion, extensions);
    }
}