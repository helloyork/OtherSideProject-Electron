import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { Color } from "../show";
import { deepMerge } from "../../../util/data";
import { ClientActionProto } from "../dgame";

export type SentenceConfig = {
    pause?: boolean | number;
} & Color;
export type WordConfig = {} & Color;

export type SentenceDataRaw = {
    text: {
        text: string;
        config: Color;
    }[];
    config: SentenceConfig;
    character: Character | null;
};

type UnSentencePrompt = (string | Word)[] | (string | Word);
export class Sentence {
    static defaultConfig: SentenceConfig = {
        color: "#fff",
        pause: true
    };
    static isSentence(obj: any): obj is Sentence {
        return obj instanceof Sentence;
    }
    static toSentence(prompt: UnSentencePrompt | Sentence): Sentence {
        return Sentence.isSentence(prompt) ? prompt : new Sentence(null, prompt);
    }
    character: Character | null;
    text: Word[];
    config: SentenceConfig;
    constructor(character: Character | null, text: (string | Word)[] | (string | Word), config: Partial<SentenceConfig> = {}) {
        this.character = character;
        this.text = this.format(text);
        this.config = deepMerge<SentenceConfig>(Sentence.defaultConfig, config);
    }
    format(text: (string | Word)[] | (string | Word)): Word[] {
        const result: Word[] = [];
        if (Array.isArray(text)) {
            for (let i = 0; i < text.length; i++) {
                if (Word.isWord(text[i])) {
                    result.push(text[i] as Word);
                } else {
                    result.push(new Word(text[i] as string));
                }
            }
        } else {
            result.push(Word.isWord(text) ? text : new Word(text));
        }
        return result;
    }
    toData(): SentenceDataRaw {
        return {
            text: this.text.map(word => word.toData()),
            config: this.config,
            character: this.character
        }
    }
}

export class Word {
    static defaultConfig: WordConfig = {
        color: "#fff"
    };
    static isWord(obj: any): obj is Word {
        return obj instanceof Word;
    }
    text: string;
    config: WordConfig;
    constructor(text: string, config: Partial<WordConfig> = {}) {
        this.text = text;
        this.config = deepMerge<WordConfig>(Word.defaultConfig, config);
    }
    toData() {
        return {
            text: this.text,
            config: this.config
        }
    }
}

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

    call(action: LogicNode.CharacterAction<any>): ClientActionProto<SentenceDataRaw> {
        const value: {
            type: string;
            id: string;
            content: any;
        } = {
            type: action.type,
            id: action.contentNode.id,
            content: void 0
        };
        if (action.type === CharacterAction.ActionTypes.say) {
            value.content = (action as LogicNode.CharacterAction<"character:say">)
                .contentNode.getContent()?.toData();
        }
        return value;
    }
}
