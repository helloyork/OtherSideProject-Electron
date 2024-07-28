import path from "path";
import { app } from "electron";

import { getAlive, setAlive } from "../../helpers/alive";
import { ExpectedHandler, ExpectedListener } from "../../preload";
import { success } from "../../util/status";
import { Prefix } from "../../util/type";
import { Game } from "../game/game";
import { FileStore } from "../game/save/storeProvider";
import { Handlers, Listeners } from "../mainHandler";
import { ServerConstants } from "../../config";

type GAME_KEY = "game";
const GAME_KEY = "game" as const;

export const handlers: Handlers<Prefix<ExpectedHandler, GAME_KEY>> = {
    "game:requestGame": async () => {
        const game = new Game({
            fileStore: new FileStore(
                await import("fs/promises"), 
                path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix)
            ),
        });
        game.createLiveGame();
        setAlive(GAME_KEY, game);
        return success();
    },
    "game:settings.get": async () => {
        const game = getAlive<Game>(GAME_KEY) ;
        return success(game.getSetting("volume"));
    },
    "game:settings.set": async (_, key, value) => {
        const game = getAlive<Game>(GAME_KEY);
        game.setSetting(key as any, value as any);
        return success();
    },
};
export const listeners: Listeners<Prefix<ExpectedListener, GAME_KEY>> = {};

