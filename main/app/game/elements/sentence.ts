import { Character } from "./character";
import { Color } from "../show";
import { deepMerge } from "../../../util/data";

export type SentenceConfig = {
    pause?: boolean | number;
} & Color;
export type WordConfig = {} & Color;

export class Sentence {
    static defaultConfig: SentenceConfig = {
        color: "#fff",
        pause: true
    };
    static isSentence(obj: any): obj is Sentence {
        return obj instanceof Sentence;
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
}
