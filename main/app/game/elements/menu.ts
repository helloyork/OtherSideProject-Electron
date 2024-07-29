import { Actionable, Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "../../../util/data";
import { Sentence, Word } from "./character";
import { ContentNode } from "../save/rollback";

export type MenuConfig = {};
export type MenuChoice = {
    action: LogicNode.Actions[];
    prompt: UnSentencePrompt | Sentence;
};

type UnSentencePrompt = (string | Word)[] | (string | Word);
type Choice = {
    action: LogicNode.Actions[];
    prompt: Sentence;
};

const { MenuAction } = LogicNode;
export class Menu extends Actionable {
    static defaultConfig: MenuConfig = {};
    static targetAction = MenuAction;
    id: string;
    prompt: Sentence;
    config: MenuConfig;
    protected choices: Choice[] = [];

    constructor(prompt: UnSentencePrompt, config?: MenuConfig);
    constructor(prompt: Sentence, config?: MenuConfig);
    constructor(prompt: UnSentencePrompt | Sentence, config: MenuConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.prompt = Sentence.isSentence(prompt) ? prompt : new Sentence(null, prompt);
        this.config = deepMerge<MenuConfig>(Menu.defaultConfig, config);
    }

    choose(choice: MenuChoice): this;
    choose(prompt: Sentence, action: (LogicNode.Actions | LogicNode.Actions[])[]): this;
    choose(prompt: UnSentencePrompt, action: (LogicNode.Actions | LogicNode.Actions[])[]): this;
    choose(choice: Sentence | MenuChoice | UnSentencePrompt, action?: (LogicNode.Actions | LogicNode.Actions[])[]): this {
        if (Sentence.isSentence(choice) && action) {
            this.choices.push({ prompt: Sentence.toSentence(choice), action: action.flat(2)  });
        } else if ((Word.isWord(choice) || Array.isArray(choice)) && action) {
            this.choices.push({ prompt: Sentence.toSentence(choice), action: action.flat(2) });
        } else if (typeof choice === "object" && "prompt" in choice && "action" in choice) {
            this.choices.push({ prompt: Sentence.toSentence(choice.prompt), action: choice.action.flat(2) });
        }
        return this;
    }

    toActions(): LogicNode.MenuAction<"menu:action">[] {
        return [
            new LogicNode.MenuAction(
                this,
                LogicNode.MenuAction.ActionTypes.action,
                new ContentNode<Menu>(
                    Game.getIdManager().getStringId()
                ).setContent(this)
            )
        ];
    }

    getChoices(): Choice[] {
        return this.choices;
    }
}

