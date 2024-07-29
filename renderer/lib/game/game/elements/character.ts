import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { Color } from "../show";
import { deepMerge } from "@lib/util/data";
import { ClientActionProto } from "../dgame";
import { HistoryData } from "../save/transaction";

export type SentenceConfig = {
    pause?: boolean | number;
    display?: boolean;
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
        pause: true,
        display: true
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
    toString() {
        return this.text.map(word => word.text).join("");
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
const CharacterActionTransaction = {
    say: "transaction:character.say",
    hide: "transaction:character.hide",
} as const;
type CharacterTransactionDataTypes = {
    [K in typeof CharacterActionTransaction[keyof typeof CharacterActionTransaction]]:
    K extends typeof CharacterActionTransaction.say ? Sentence :
    K extends typeof CharacterActionTransaction.hide ? Sentence :
    any;
}

const { CharacterAction } = LogicNode;
export class Character extends Actionable<typeof CharacterActionTransaction, CharacterTransactionDataTypes> {
    name: string;
    config: CharacterConfig;

    constructor(name: string, config: CharacterConfig = {}) {
        super();
        this.name = name;
        this.config = config;
    }
    public say(content: string): Character;
    public say(content: Sentence): Character;
    public say(content: (string | Word)[]): Character;
    public say(content: string | Sentence | (string | Word)[]): Character {
        const sentence: Sentence =
            Array.isArray(content) ?
                new Sentence(this, content, {}) :
                (Sentence.isSentence(content) ? content : new Sentence(this, content, {}));
        const action = new CharacterAction<typeof CharacterAction.ActionTypes.say>(
            this,
            CharacterAction.ActionTypes.say,
            new ContentNode<Sentence>(
                Game.getIdManager().getStringId(),
            ).setContent(sentence)
        );
        this.transaction.commitWith<typeof CharacterActionTransaction.say>({
            type: CharacterActionTransaction.say,
            data: sentence
        });
        this.actions.push(action);
        return this;
    }

    public $hideSay(sentence: Sentence): Character {
        sentence.config.display = false;
        this.transaction.commitWith<typeof CharacterActionTransaction.hide>({
            type: CharacterActionTransaction.hide,
            data: sentence
        });
        return this;
    }

    undo(history: HistoryData<typeof CharacterActionTransaction, CharacterTransactionDataTypes>): void {
        if (history.type === CharacterActionTransaction.say) {
            history.data.config.display = false;
        } else if (history.type === CharacterActionTransaction.hide) {
            history.data.config.display = true;
        }
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
