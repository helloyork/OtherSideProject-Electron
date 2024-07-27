import { ClientAPI } from "../api/ipc";
import { deepMerge } from "../util/data";

export type ClientGameConfig = {};
export type ClientRequirement = {
    clientAPI: ClientAPI;
};
export type ClientGamePreference = {
    afm: boolean;
};

class BaseGame {};
export class ClientGame extends BaseGame {
    static defaultConfig: ClientGameConfig = {};
    static defaultPreference: ClientGamePreference = {
        afm: false,
    };
    config: ClientGameConfig;
    clientAPI: ClientAPI;
    preference: ClientGamePreference;
    
    constructor(config: ClientGameConfig = {}, requirement: ClientRequirement) {
        super();
        this.config = deepMerge<ClientGameConfig>(ClientGame.defaultConfig, config);
        this.clientAPI = requirement.clientAPI;
        this.preference = deepMerge<ClientGamePreference>(ClientGame.defaultPreference, {});
    }
    async init() {}
}

