import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Status, success } from './util/status';
import { GameSettings } from './app/game/game';
import { ServerConstants } from './config';

const api = {
    hello(...args: any[]) {
        return ipcRenderer.invoke("hello", ...args);
    },
    winFrame: {
        minimize() {
            ipcRenderer.send("window:minimize");
        },
        maximize() {
            ipcRenderer.send("window:maximize");
        },
        close() {
            ipcRenderer.send("window:close");
        },
    },
    game: {
        async requestGame() {
            return await ipcRenderer.invoke("game:requestGame");
        },
        async setSettings<T extends keyof GameSettings>(key: T, settings: GameSettings[T]) {
            return await ipcRenderer.invoke("game:settings.set", key, settings);
        },
        async getSettings<T extends keyof GameSettings>(key: keyof T): Promise<Status<GameSettings[T]>> {
            return await ipcRenderer.invoke("game:settings.get", key);
        },
    },
}

const app = {
    info: {
        version: ServerConstants.info.version,
        isProd: process.env.NODE_ENV === "production",
    }
}

/**
 * This is the object that will be exposed to the renderer process.
 */
const WindowWrapper: Window = {
    api: api,
    app: app,
}

!function () {
    Object.keys(WindowWrapper).forEach(key => {
        contextBridge.exposeInMainWorld(key, WindowWrapper[key as keyof Window]);
    });
    return void 0;
}();

/**
 * This is the object that will be exposed to the renderer process.
 */
export interface Window {
    api: {
        hello: () => Promise<ExpectedHandler["hello"]>;
        winFrame: {
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
        game: {
            requestGame: () => Promise<ExpectedHandler["game:requestGame"]>;
            setSettings: <T extends keyof GameSettings>(key: T, settings: GameSettings[T]) => Promise<ExpectedHandler["game:settings.set"]>;
            getSettings: <T extends keyof GameSettings>(key: keyof T) => Promise<ExpectedHandler["game:settings.get"]>;
        };
    };
    app: {
        info: {
            version: string;
            isProd: boolean;
        }
    }
}
/**
 * after invoking, the return value will be returned to the renderer process.
 */
export interface ExpectedHandler {
    "hello": void;
    "game:requestGame": Status<void>;
    "game:settings.set": Status<void, Error>;
    "game:settings.get": Status<any, Error>;
    "game:settings.all": Status<GameSettings, Error>;
}

export interface ExpectedListener {
    "window:minimize": void;
    "window:maximize": void;
    "window:close": void;
}
