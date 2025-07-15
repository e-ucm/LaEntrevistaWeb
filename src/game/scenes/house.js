import LaEntrevistaBaseScene from "../laEntrevistaBaseScene.js";
import TextArea from "../../framework/UI/textArea.js";
import GameStage from "../gameStage.js";
import { growAnimation } from "../../framework/utils/graphics.js";

export default class House extends LaEntrevistaBaseScene {
    /**
    * Escena de la casa
    * @extends BaseScene
    */
    constructor() {
        super("House");
    }

    create() {
        super.create();

        this.namespace = "scenes\\house";
        this.nodes = this.cache.json.get("house");
        this.node = this.dialogManager.readNodes(this, this.nodes, this.namespace, "start");

        this.BGS_X = 801;
        this.BGS_Y = 352;

        this.cvStage = new GameStage("CVQuestions", 5);

        this.createBrowser();
        this.createDesktop();

        let img = this.add.image(0, 0, "blankScreen").setOrigin(0, 0);

        this.blackboard.set("errors", 0);
        this.dispatcher.add("wrongAnswer", this, () => {
            let errors = this.blackboard.get("errors");
            this.blackboard.set("errors", errors + 1);
        });

        this.dispatcher.add("changeHouseTopic", this, () => {
            // TRACKER EVENT
            this.cvStage.progress(this.blackboard.get("errors"));
        });
    }

    onCreate() {
        setTimeout(() => {
            this.dialogManager.setNode(this.node);
        }, 500);
    }

    createBrowser() {
        let browser = this.add.image(this.BGS_X, this.BGS_Y, "browser");

        let portalLogo = this.add.image(565, this.BGS_Y, "portalLogo").setScale(0.55);
        portalLogo.setInteractive();
        let maxWidth = 450;
        let textConfig = {
            fontFamily: "Arial",
            fontSize: 75,
            fontStyle: "bold",
            color: "#000000",
            align: "left",
            wordWrap: {
                width: maxWidth,
                useAdvancedWrap: true
            }
        }
        let portalText = new TextArea(this, 800, portalLogo.y, maxWidth, portalLogo.displayHeight, this.localizationManager.translate("platform", "scenes"), textConfig, 0, 0.5);
        portalText.adjustFontSize();

        let sendCompleteCV = (success) => {
            this.cvStage.progress(this.blackboard.get("errors"));
            this.cvStage.complete(success, true);
        };

        this.dispatcher.add("noOffersFound", this, () => {
            // TRACKER EVENT
            sendCompleteCV(false);
            this.cvStage.initialize();
        });

        this.dispatcher.add("offersFound", this, () => {
            // TRACKER EVENT
            sendCompleteCV(true);

            this.createOffers(portalLogo, portalText, textConfig);
        });
    }

    createOffers(portalLogo, portalText, textConfig) {
        portalLogo.setVisible(false);
        portalText.setVisible(false);

        let ICONS_Y = 300;
        let TEXT_Y = 460;
        textConfig.fontSize = 40;
        textConfig.fontFamily = 40;
        textConfig.fontFamily = "barlowCondensed-regular";
        textConfig.fontStyle = "normal";

        let programmingIcon = this.add.image(600, ICONS_Y, "programming");
        let programmingText = new TextArea(this, programmingIcon.x, TEXT_Y, programmingIcon.displayWidth, programmingIcon.displayHeight,
            this.localizationManager.translate("programming", "scenes").toUpperCase(), textConfig);
        programmingText.adjustFontSize();

        let dataIcon = this.add.image(1005, ICONS_Y, "data");
        let dataText = new TextArea(this, dataIcon.x, TEXT_Y, dataIcon.displayWidth, dataIcon.displayHeight, this.localizationManager.translate("data", "scenes").toUpperCase(), textConfig);
        dataText.adjustFontSize();
        
        growAnimation(programmingIcon, programmingIcon, () => {
            this.gameManager.blackboard.set("position", "programming");

            // TRACKER EVENT
            this.trackerManager.sendSelectJobPosition("programming");

            this.node = this.dialogManager.readNodes(this, this.nodes, this.namespace, "selectOffer");
            this.dialogManager.setNode(this.node);
        }, true, 1.1, true, 50);

        growAnimation(dataIcon, dataIcon, () => {
            this.gameManager.blackboard.set("position", "dataScience");

            // TRACKER EVENT
            this.trackerManager.sendSelectJobPosition("dataScience");

            this.node = this.dialogManager.readNodes(this, this.nodes, this.namespace, "selectOffer");
            this.dialogManager.setNode(this.node);
        }, true, 1.1, true, 50);

        this.dispatcher.add("updateCV", this, () => {
            programmingIcon.off("pointerdown");
            dataIcon.off("pointerdown");

            // TRACKER EVENT
            this.gameManager.progressGame();

            this.gameManager.startHallScene();
        });
    }

    sendSelectJobPosition(jobPosition) {
        xApiTracker.alternativeTracker.Selected("jobPosition", jobPosition, JSTracker.ALTERNATIVETYPE.MENU);
    }

    createDesktop() {
        this.desktop = this.add.image(this.BGS_X, this.BGS_Y, "desktop");

        this.dispatcher.add("startSearch", this, () => {
            this.setInteractive(this.desktop);
            this.desktop.on("pointerdown", () => {
                if (this.dialogManager.currNode == null) {
                    // TRACKER EVENT
                    this.cvStage.initialize();

                    // TRACKER EVENT
                    this.trackerManager.sendInteractGameObject("searchIcon");

                    this.desktop.setVisible(false);
                    this.desktop.disableInteractive();

                    this.node = this.dialogManager.readNodes(this, this.nodes, this.namespace, "search");
                    this.dialogManager.setNode(this.node);
                }
            });
        });

    }
}