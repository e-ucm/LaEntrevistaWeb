import BaseUI from "../../framework/UI/baseUI.js";
import DialogManager from "../managers/dialogManager.js";
import TextArea from "../../framework/UI/textArea.js";
import CV from "../UI/cv.js"
import GameManager from "../managers/gameManager.js";
import AnimatedContainer from "../../framework/UI/animatedContainer.js";
import DefaultEventNames from "../../framework/utils/eventNames.js";

export default class UI extends BaseUI {
    constructor() {
        super("UI", "UI");
    }

    init(params) {
        super.init(params);

        this.textboxConfig = {
            imgAtlas: "uiElements",
            img: "textbox",
            imgX: this.CANVAS_WIDTH * 0.49,
            imgY: this.CANVAS_HEIGHT,
            imgOriginY: 1,
            textX: 180,
            textY: 715,
            realWidth: 1240,
            realHeight: 160,
        }
        this.nameBoxConfig = {
            img: "",
            textX: 385,
            textY: 642,
            realWidth: 320,
            realHeight: 60,
        }
        this.textConfig = {
            fontFamily: "lexend-variable",
            fontSize: 27,
            fontStyle: 600
        }
        this.nameTextConfig = {
            fontFamily: "lexend-variable",
            fontSize: 40,
            fontStyle: 600,
            align: "center"
        }
        this.optionBoxConfig = {
            imgAtlas: "uiElements",
            img: "optionBox",
            boxSpacing: 10,
            textPaddingX: 70,
            textPaddingY: 10,
            textOffsetX: 0,
            textOffsetY: 0,
        }
        this.optionsTextConfig = { ... this.textConfig };
        this.optionsTextConfig.fontSize = 35;
        this.optionsTextConfig.align = "center";
        this.optionsTextConfig.wordWrap = {
            width: 1,
            useAdvancedWrap: true
        }

        this.QUESTION_TEXT_DEFAULT_SIZE = 50;
        let QUESTION_TEXT_MARGIN = 10;
        this.optionsQuestionTextConfig = { ...this.optionsTextConfig };
        this.optionsQuestionTextConfig.fontSize = this.QUESTION_TEXT_DEFAULT_SIZE;
        this.optionsQuestionTextConfig.wordWrap.width = this.CANVAS_WIDTH - QUESTION_TEXT_MARGIN * 2;
        this.optionsQuestionTextConfig.stroke = "#000";
        this.optionsQuestionTextConfig.strokeThickness = 7;
    }

    create(params) {
        super.create(params);
        this.dialogManager = DialogManager.getInstance();
        this.gameManager = GameManager.getInstance();

        this.cv = new CV(this);
        this.cv.setDepth(10);
        
        let questionTextConfig = { ...this.textConfig };
        questionTextConfig.align = "center";
        questionTextConfig.strokeThickness = 5;
        questionTextConfig.stroke = "#000000";

        
        this.darkBg = this.add.rectangle(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT, 0x000, 0.7).setOrigin(0, 0);
        this.questionText = new TextArea(this, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2, this.optionsQuestionTextConfig.wordWrap.width, this.CANVAS_HEIGHT / 2, 
            "", this.optionsQuestionTextConfig, 0.5, 0.5);
            
        this.questionBgElements = new AnimatedContainer(this, 0, 0);
        this.questionBgElements.add(this.darkBg);
        this.questionBgElements.add(this.questionText);
        this.questionBgElements.setVisible(false);

        this.dispatcher.add(DefaultEventNames.endNodes, this, () => {
            this.questionBgElements.activate(false);
        });
    }


    startTextNode(node) {
        this.questionBgElements.activate(false);
        if (this.cv.visible) {
            let fn = () => {
                super.startTextNode(node);
                this.cv.off("pointerdown", fn);
            }
            this.cv.on("pointerdown", fn);
        }
        else {
            super.startTextNode(node);
        }
    }


    createOptions(node) {
        super.createOptions(node);

        if (this.textbox.textObj.text != "") {
            this.questionText.setText(this.textbox.fullText);
            this.questionText.setFontSize(this.QUESTION_TEXT_DEFAULT_SIZE);

            this.questionText.adjustFontSize();
            this.questionText.y = this.optionBoxes[0].getBounds().y / 2;
        }
        this.questionBgElements.activate(true);
    }

    removeOptions() {
        if (this.optionBoxes.length <= 0) {
            this.questionBgElements.activate(false);
        }
        super.removeOptions();
    }
}