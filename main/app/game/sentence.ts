import { Character } from "./character";

export type SentenceConfig = {}

export class Sentence {
    character: Character | null;
    text: string;
    config: SentenceConfig;
    constructor(character: Character | null, text: string, config: SentenceConfig) {
        this.character = character;
        this.text = text;
        this.config = config;
    }
}
