import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
  }
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
    contextBridge.exposeInMainWorld(key, WindowWrapper[key]);
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
  "hello": any[];
}

export interface ExpectedListener {
  "window:minimize": void;
  "window:maximize": void;
  "window:close": void;
}
