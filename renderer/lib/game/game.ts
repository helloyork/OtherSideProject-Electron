import { ClientAPI } from "../api/ipc";
import { deepMerge } from "../util/data";

export type ClientGameConfig = {};
export type ClientRequirement = {
    clientAPI: ClientAPI;
};

class BaseGame {};
export class ClientGame extends BaseGame {
    static defaultConfig: ClientGameConfig = {};
    config: ClientGameConfig;
    clientAPI: ClientAPI;
    constructor(config: ClientGameConfig = {}, requirement: ClientRequirement) {
        super();
        this.config = deepMerge<ClientGameConfig>(ClientGame.defaultConfig, config);
        this.clientAPI = requirement.clientAPI;
    }
    async init() {}
}

