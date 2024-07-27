import { ClientAPI } from "../api/ipc";
import { deepMerge } from "../util/data";

export type ClientGameConfig = {};
export type ClientRequirement = {
    clientAPI: ClientAPI;
};
export type ClientGamePreference = {
    afm: boolean;
};
type ClientGamePreferenceHelper = {
    setPreference: <K extends keyof ClientGamePreference>(key: keyof ClientGamePreference, value: ClientGamePreference[K]) => void;
    getPreference: <K extends keyof ClientGamePreference>(key: keyof ClientGamePreference) => ClientGamePreference[K];
}

class BaseGame {};
export class ClientGame extends BaseGame {
    static defaultConfig: ClientGameConfig = {};
    static defaultPreference: ClientGamePreference = {
        afm: false,
    };
    config: ClientGameConfig;
    clientAPI: ClientAPI;
    preference: ClientGamePreference & ClientGamePreferenceHelper;
    
    constructor(config: ClientGameConfig = {}, requirement: ClientRequirement) {
        super();
        this.config = deepMerge<ClientGameConfig>(ClientGame.defaultConfig, config);
        this.clientAPI = requirement.clientAPI;
        this.preference = {
            ...deepMerge<ClientGamePreference>(ClientGame.defaultPreference, {}),
            setPreference: (key, value) => {
                this.preference[key] = value;
            },
            getPreference: (key) => {
                return this.preference[key];
            },
        };
    }
    async init() {}
}

