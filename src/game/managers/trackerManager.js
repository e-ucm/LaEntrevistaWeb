import BaseTrackerManager from "../../framework/managers/baseTrackerManager.js";

class Completable {
    /**
    * Clase que representa un objeto que puede ser completado.
    * Proporciona metodos para notificar el inicio, progreso y finalizacion del objeto
    * @param {SeriousGameTracker} seriousGameTracker - instancia del tracker
    * @param {String} id - identificador de los eventos
    * @param {String} type - tipo del elemento Completable
    */
    constructor(seriousGameTracker, id, type) {
        this.seriousGameTracker = seriousGameTracker;
        this.id = id;
        this.type = type;
    }

    initialize() {
        this.seriousGameTracker.Completable(this.id, this.type)
            .Initialized()
            .Send();
    }

    progress(completedSteps, totalSteps, extensions = {}) {
        let progress = completedSteps / totalSteps;

        this.seriousGameTracker.Completable(this.id, this.type)
            .Progressed(progress)
            .WithScore({
                raw: completedSteps,
                min: 0,
                max: totalSteps,
                scaled: progress
            })
            .WithResultExtensions(extensions);
    }

    complete(success, completion, completedSteps, totalSteps) {
        let progress = completedSteps / totalSteps;

        this.seriousGameTracker.Completable(this.id, this.type)
            .Completed(success, completion, completedSteps)
            .WithScoreScaled(progress);
    }
}

// Extiendee BaseTrackerManager para implementar funcionalidad exclusiva del control de eventos del juego
export default class TrackerManager extends BaseTrackerManager {
    createGameStageCompletable(id) {
        return new Completable(this.seriousGameTracker, id, this.seriousGameTracker.COMPLETABLETYPE.STAGE);
    }

    sendSelectJobPosition(jobPosition) {
        this.sendSelectMenuOption("jobPosition", jobPosition);
    }

    sendSelectAccessFinalQuestions(access) {
        this.sendSelectChoice("accessFinalQuestions", access)
    }

    sendInteractHRDoor(state) {
        this.sendInteractGameObject("humanResourcesDoor", false,
            { "state": state });
    }
}