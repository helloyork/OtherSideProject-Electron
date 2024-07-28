import path from "path";
import { app } from "electron";

import { getAlive, setAlive } from "../../helpers/alive";
import { ExpectedHandler, ExpectedListener } from "../../preload";
import { failure, Status, success } from "../../util/status";
import { Prefix } from "../../util/type";
import { Game, GameSettings } from "../game/game";
import { FileStore } from "../game/save/storeProvider";
import { Handlers, Listeners } from "../mainHandler";
import { ServerConstants } from "../../config";

type GAME_KEY = "game";
const GAME_KEY = "game" as const;

export const handlers: Handlers<Prefix<ExpectedHandler, GAME_KEY>> = {
    "game:requestGame": async () => {
        const game = new Game({
            settingFileStore: new FileStore(
                await import("fs/promises"), 
                path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix)
            ),
            saveFileStore: new FileStore(
                await import("fs/promises"), 
                path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix)
            ),
        });
        game.createLiveGame();

        await game.init();

        setAlive(GAME_KEY, game);
        return success();
    },
    "game:settings.get": async () => {
        const game = getAlive<Game>(GAME_KEY);
        if (!game) return failure(new Error("Game not found"));

        console.log(game.settings);

        return success(game.getSetting("volume"));
    },
    "game:settings.set": async (_, key, value) => {
        const game = getAlive<Game>(GAME_KEY);
        if (!game) return failure(new Error("Game not found"));

        if (typeof key !== "string") return failure(new Error("Invalid key"));

        game.setSetting(key as any, value as any);
        await game.saveSettings();
        
        return success();
    },
    "game:settings.all": async function (): Promise<Status<GameSettings, Error>> {
        const game = getAlive<Game>(GAME_KEY);
        if (!game) return failure(new Error("Game not found"));

        return success(game.settings);
    }
};
export const listeners: Listeners<Prefix<ExpectedListener, GAME_KEY>> = {};

