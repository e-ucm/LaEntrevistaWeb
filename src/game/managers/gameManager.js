import Blackboard from "../../framework/utils/blackboard.js";
import Singleton from "../../framework/utils/singleton.js";
import SceneManager from "../../framework/managers/sceneManager.js";
import EventDispatcher from "../../framework/managers/eventDispatcher.js";
import LocalizationManager from "../../framework/managers/localizationManager.js";
import TrackerManager from "./trackerManager.js"
import GameStage from "../gameStage.js"

export default class GameManager extends Singleton {
    constructor() {
        super("GameManager");

        this.sceneManager = SceneManager.getInstance();
        this.dispatcher = EventDispatcher.getInstance();
        this.trackerManager = TrackerManager.getInstance();

        // Blackboard de variables de todo el juego
        this.blackboard = new Blackboard();
        this.ui = null;

        this.charactersStage = new GameStage("charactersInteracted", 8);
        this.questionsStage = new GameStage("finalQuestions", 9);

        this.gameCompleted = false;
        this.nGameStages = 0;
        this.N_REQUIRED_GAME_STAGES = 4;
        this.gameTitle = "LaEntrevistaWeb";
        this.startTime = null;

    }

    init() {
        LocalizationManager.getInstance().subscribeBlackboard(this.blackboard);

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
        if (this.ui == null) {
            this.sceneManager.runInParalell("UI");
            this.ui = this.sceneManager.getScene("UI");
        }

        this.sceneManager.changeScene("MainMenu", null, fadeAnim);
    }

    startGame() {
        // TRACKER EVENT
        this.trackerManager.sendInitializeGame();

        this.nGameStages = 0;

        this.blackboard.clear();

        this.dispatcher.removeAll();

        if (this.ui.dispatcher != null) {
            this.ui.shutdown();
            this.sceneManager.restartScene("UI");
        }

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

        this.startHouseScene();
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
            this.questionsStage.reset();
        }

        this.sceneManager.changeScene("Mirror", { fromMenu: fromMenu }, true, false);

        if (this.questionsStage.hasCompleted()) {
            this.dispatcher.dispatch("allQuestionsComplete");

            // TRACKER EVENT
            this.questionsStage.complete(true, true);

            if (!fromMenu) {
                this.gameCompleted = true;

                // TRACKER EVENT
                this.trackerManager.sendCompleteGame(true);
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
        this.charactersStage.progress();

        if (this.charactersStage.hasCompleted()) {
            this.dispatcher.dispatch("allPeopleInteracted");

            // TRACKER EVENT
            this.charactersStage.complete(true, true);
        }
    }

    async progressGame() {
        ++this.nGameStages;

        let progress = this.nGameStages / this.N_REQUIRED_GAME_STAGES;
        await this.trackerManager.sendProgressGame(progress);
    }
}