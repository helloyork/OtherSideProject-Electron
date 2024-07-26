import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Status, success } from './util/status';

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
    }
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
}

export interface ExpectedListener {
  "window:minimize": void;
  "window:maximize": void;
  "window:close": void;
}
