import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { Sentence, Word } from "./sentence";

export type CharacterConfig = {}

const { CharacterAction } = LogicNode;
export class Character extends Actionable {
    name: string;
    config: CharacterConfig;

    constructor(name: string, config: CharacterConfig = {}) {
        super();
        this.name = name;
        this.config = config;
    }
    say(content: string): Character;
    say(content: Sentence): Character;
    say(content: (string | Word)[]): Character;
    say(content: string | Sentence | (string | Word)[]): Character {
        const sentence: Sentence =
            Array.isArray(content) ?
                new Sentence(this, content, {}) :
                (Sentence.isSentence(content) ? content : new Sentence(this, content, {}));
        const action = new CharacterAction<typeof CharacterAction.ActionTypes.say>(
            this,
            CharacterAction.ActionTypes.say,
            new ContentNode<Sentence>(
                Game.getIdManager().getStringId()
            ).setContent(sentence)
        );
        this.actions.push(action);
        return this;
    }
}