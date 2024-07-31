import { Actionable, Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "@lib/util/data";
import { Sentence, Word } from "./text";
import { ContentNode, RenderableNode } from "../save/rollback";
import { GameState } from "@/lib/ui/components/player/player";

export type MenuConfig = {};
export type MenuChoice = {
    action: LogicNode.Actions[];
    prompt: UnSentencePrompt | Sentence;
};

type UnSentencePrompt = (string | Word)[] | (string | Word);
export type Choice = {
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

    public choose(choice: MenuChoice): this;
    public choose(prompt: Sentence, action: (LogicNode.Actions | LogicNode.Actions[])[]): this;
    public choose(prompt: UnSentencePrompt, action: (LogicNode.Actions | LogicNode.Actions[])[]): this;
    public choose(choice: Sentence | MenuChoice | UnSentencePrompt, action?: (LogicNode.Actions | LogicNode.Actions[])[]): this {
        if (Sentence.isSentence(choice) && action) {
            this.choices.push({ prompt: Sentence.toSentence(choice), action: action.flat(2)  });
        } else if ((Word.isWord(choice) || Array.isArray(choice)) && action) {
            this.choices.push({ prompt: Sentence.toSentence(choice), action: action.flat(2) });
        } else if (typeof choice === "object" && "prompt" in choice && "action" in choice) {
            this.choices.push({ prompt: Sentence.toSentence(choice.prompt), action: choice.action.flat(2) });
        }
        return this;
    }

    construct(actions: LogicNode.Actions[], lastChild?: RenderableNode): LogicNode.Actions[] {
        for (let i = 0; i < this.choices.length; i++) {
            let node = actions[i].contentNode;
            let child = actions[i + 1]?.contentNode;
            if (child) {
                node.addChild(child);
            }
            if (i === this.choices.length - 1 && lastChild) {
                node.addChild(lastChild);
            }
        }
        return actions;
    }

    $setChild(child: RenderableNode): this {
        this.choices.forEach(choice => {
            choice.action[choice.action.length - 1].contentNode.addChild(child);
        });
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

    $constructChoices(state: GameState): Choice[] {
        return this.choices.map(choice => {
            return {
                action: this.construct(choice.action),
                prompt: choice.prompt
            };
        });
    }
}

