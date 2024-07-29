import path from "path";
import fs from "fs/promises";
import { app } from "electron";

import { getAlive, setAlive } from "../../helpers/alive";
import { ExpectedHandler, ExpectedListener } from "../../preload";
import { failure, Status, success } from "../../util/status";
import { Prefix } from "../../util/type";
import { Game } from "../game/game";
import { GameSettings } from "../game/dgame";
import { FileStore } from "../../util/storeProvider";
import { Handlers, Listeners } from "../mainHandler";
import { ServerConstants } from "../../config";
import * as test from "../test/test";

type GAME_KEY = "game";
const GAME_KEY = "game" as const;

export const handlers: Handlers<Prefix<ExpectedHandler, GAME_KEY>> = {
    "game:requestGame": async () => {
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
    },
    "game:store.write": async (_, name, data) => {
        if (typeof name !== "string" || (typeof data !== "object" && data !== null)) return failure(new Error("Invalid arguments"));
        const fileStore = new FileStore(fs, path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix));
        await fileStore.save(name as string, data as Record<string, any>);
        return success();
    },
    "game:store.read": async (_, name) => {
        if (typeof name !== "string") return failure(new Error("Invalid arguments"));
        const fileStore = new FileStore(fs, path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix));
        return success(await fileStore.load(name as string));
    },
    "game:store.list": async () => {
        const fileStore = new FileStore(fs, app.getPath("userData"));
        return success(await fileStore.getFileNames(ServerConstants.app.appDataPrefix));
    },
    "game:store.isExists": async (_, name) => {
        if (typeof name !== "string") return failure(new Error("Invalid arguments"));
        const fileStore = new FileStore(fs, path.resolve(app.getPath("userData"), ServerConstants.app.appDataPrefix));
        return success(await fileStore.isFileExists(name as string));
    }
};
export const listeners: Listeners<Prefix<ExpectedListener, GAME_KEY>> = {};

