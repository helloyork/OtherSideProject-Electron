import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const handler = {
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

/**
 * This is the object that will be exposed to the renderer process.
 */
const WindowWrapper: Window = {
  api: handler,
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
