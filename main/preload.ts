import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const handler = {
  hello(...args: any[]) {
    return ipcRenderer.invoke("hello", ...args);
  },
  helloAsync() {
    return ipcRenderer.invoke("helloAsync");
  }
}

const WindowWrapper: Window = {
  api: handler,
}

!function() {
  Object.keys(WindowWrapper).forEach(key => {
    contextBridge.exposeInMainWorld(key, WindowWrapper[key]);
  });
  return void 0;
}();

export type IpcHandler = typeof handler;
export interface Window {
  api: {
    hello: () => Promise<ExpectedHandler["hello"]>;
  };
}
export interface ExpectedHandler {
  "hello": any[];
  "helloAsync": string;
}
