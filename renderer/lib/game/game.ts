import { deepMerge } from "../util/data";

export type ClientGameConfig = {};

class BaseGame {};
export class Game extends BaseGame {
    static defaultConfig: ClientGameConfig = {};
    config: ClientGameConfig;
    constructor(config: ClientGameConfig = {}) {
        super();
        this.config = deepMerge<ClientGameConfig>(Game.defaultConfig, config);
    }
}

