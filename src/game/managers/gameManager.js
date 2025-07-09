import Blackboard from "../../framework/utils/blackboard.js";
import Singleton from "../../framework/utils/singleton.js";
import SceneManager from "../../framework/managers/sceneManager.js";
import EventDispatcher from "../../framework/managers/eventDispatcher.js";

import { getDifferenceTimeInS } from "../../framework/utils/misc.js";
import { GameStage } from "../gameStage.js";
import xApiTracker from "../../framework/lib/xApiTracker.js";

export default class GameManager extends Singleton {
    constructor() {
        super("GameManager");

        this.sceneManager = SceneManager.getInstance();
        this.dispatcher = EventDispatcher.getInstance();

        // Blackboard de variables de todo el juego
        this.blackboard = new Blackboard();

        this.ui = null;

        this.charactersInteracted = new GameStage("charactersInteracted", 8);

        this.questionsCompleted = new GameStage("endQuestions", 9);

        this.gameCompleted = false;
        this.nGameStages = 0;
        this.N_REQUIRED_GAME_STAGES = 4;
        this.gameTitle = "LaEntrevistaWeb";
        this.startTime = null;

    }

    init() {
        // Hay que setearlo antes del menu para poder visualizar las preguntas desde el mismo correctamente
        this.blackboard.set("position", "dataScience");

        this.startLanguageMenu();

        // TEST
        // this.startGame();
        // this.startMainMenu();
    }

    startLanguageMenu() {
        this.sceneManager.changeScene("LanguageMenu", null, false);
    }

    startMainMenu(fadeAnim = true) {
        this.sceneManager.changeScene("MainMenu", null, fadeAnim);
    }

    startGame() {
        if (this.ui == null) {
            this.sceneManager.runInParalell("UI");
            this.ui = this.sceneManager.getScene("UI");
        }

        // TRACKER EVENT
        this.sendInitializeGame();

        this.nGameStages = 0;
        this.charactersInteracted.reset();
        this.questionsCompleted.reset();

        this.blackboard.clear();
        this.dispatcher.removeAll();

        if (this.ui.dispatcher != null) {
            this.ui.shutdown();
            this.sceneManager.restartScene("UI");
        }

        this.startHouseScene();

        // TEST
        // this.startMainMenu();
        // this.startHallScene();
        // this.startCorridorScene();
        // this.startCafeteriaScene();
        // this.startWaitingRoomScene();
        // this.startOfficeScene();
        // this.startMirrorScene(false);
        // this.startQuestionScene(1);
        // this.startCreditsScene();
        // this.startLanguageMenu();
    }


    startHouseScene() {
        this.sceneManager.changeScene("House", null, true);
    }

    startHallScene() {
        this.sceneManager.changeScene("Hall", null, true);
    }

    startCorridorScene() {
        this.sceneManager.changeScene("Corridor", null, true, true);
    }

    startCafeteriaScene() {
        this.sceneManager.changeScene("Cafeteria", null, true, true);
    }

    startWaitingRoomScene() {
        this.sceneManager.changeScene("WaitingRoom", null, true, true);
    }

    startOfficeScene() {
        this.sceneManager.changeScene("Office", null, true, true);
    }

    startMirrorScene(fromMenu) {
        if (fromMenu) {
            this.questionsCompleted.reset();
        }
        this.sceneManager.changeScene("Mirror", { fromMenu: fromMenu}, true, false);
        if (this.questionsCompleted.hasCompleted()) {
            this.dispatcher.dispatch("allQuestionsComplete");

            // TRACKER EVENT
            this.questionsCompleted.complete(true, true);

            if (!fromMenu) {
                // TRACKER EVENT
                this.gameManager.increaseGameProgress();

                this.gameCompleted = true;

                // TRACKER EVENT
                this.sendCompleteGame();
            }
        }
    }

    startQuestionScene(fromMenu, number) {
        this.sceneManager.changeScene("Question" + number, { fromMenu: fromMenu, number: number }, true, true);
    }

    startCreditsScene(fadeAnim = true) {
        this.sceneManager.changeScene("Credits", null, fadeAnim);
    }


    /**
    * Incrementar el numero de personajes con los que se ha hablado
    */
    increaseCharactersInteracted() {
        // TRACKER EVENT
        this.charactersInteracted.progress();

        if (this.charactersInteracted.hasCompleted()) {
            this.dispatcher.dispatch("allPeopleInteracted");

            // TRACKER EVENT
            this.charactersInteracted.complete(true, true);
        }
    }

    async sendInitializeGame() {
        this.startTime = new Date();
        await xApiTracker.completableTracker.Initialized(this.gameTitle, JSTracker.COMPLETABLETYPE.GAME);
        await xApiTracker.sendBatch();
    }

    async increaseGameProgress() {
        ++this.nGameStages;

        let progress = this.nGameStages / this.N_REQUIRED_GAME_STAGES;
        let duration = getDifferenceTimeInS(this.startTime);
        await xApiTracker.completableTracker.Progressed(this.gameTitle, JSTracker.COMPLETABLETYPE.GAME, progress)
            .withProgress(progress)
            .withDuration(duration);
        await xApiTracker.sendBatch();
    }

    async sendCompleteGame() {
        let duration = getDifferenceTimeInS(this.startTime);
        await xapiTracker.completableTracker.Completed(this.gameTitle, JSTracker.COMPLETABLETYPE.GAME, this.gameCompleted, this.gameCompleted)
            .withDuration(duration);
        await xApiTracker.sendBatch();
    }

    sendInteractItem(id, npc = false, extensions = {}) {
        let type = JSTracker.GAMEOBJECTTYPE.ITEM;
        if (npc) {
            type = JSTracker.GAMEOBJECTTYPE.NPC;
        }
        xApiTracker.gameObjectTracker.Interacted(id, type)
            .apply(statement => statement.addResultExtensions(extensions));
    }
}