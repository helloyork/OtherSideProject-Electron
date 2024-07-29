import { ClientAPI } from "../api/ipc";
import { deepMerge } from "../util/data";
import { Game } from "./game/game";
import { FileStore } from "./game/save/storeProvider";
import * as _test from "./test/test";

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
    game: Game;
    
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
    init() {
        // @TODO: Implement this
        this.game = new Game({
            settingFileStore: new FileStore(
                null as any,
                null as any
            ),
            saveFileStore: new FileStore(
                null as any,
                null as any
            ),
            clientGame: this
        });
        this.game.init();
        this.game.registerStory(_test.story);
        this.game.createLiveGame();
        this.game.getLiveGame().loadStory(_test.story);
        return this;
    }
    
    public async choose() {} // @TODO: Implement this
}

