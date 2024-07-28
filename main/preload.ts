import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Status, success } from './util/status';
import { GameSettings } from './app/game/game';

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
      const result = await ipcRenderer.invoke("game:requestGame");
      return success(result);
    },
    async setSettings<T extends keyof GameSettings>(key: T, settings: GameSettings[T]) {
      const result = await ipcRenderer.invoke("game:settings.set", key, settings);
      return success(result);
    },
    async getSettings<T extends keyof GameSettings>(key: keyof T): Promise<Status<GameSettings[T]>> {
      const result = await ipcRenderer.invoke("game:settings.get", key);
      return success(result);
    },
  },
}

const app = {
  info: {
    version: "0.0.1",
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

!function() {
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
  "game:settings.set": Status<void>;
  "game:settings.get": Status<any>;
}

export interface ExpectedListener {
  "window:minimize": void;
  "window:maximize": void;
  "window:close": void;
}
