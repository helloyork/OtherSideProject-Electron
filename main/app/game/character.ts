
export type CharacterConfig = {}

export class Character {
    name: string;
    config: CharacterConfig;
    constructor(name: string, config: CharacterConfig) {
        this.name = name;
        this.config = config;
    }
}

