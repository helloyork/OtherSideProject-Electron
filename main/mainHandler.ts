import type { ExpectedHandler } from "./preload";
import { Singleton } from "./util/singleton";

type Handlers = {
    [K in keyof ExpectedHandler]: () => Promise<ExpectedHandler[K]> | ExpectedHandler[K];
};

const handlers: Handlers = {
    hello: (...args) => [...args],
    helloAsync: async () => Promise.resolve("hello async!"),
};
const listeners: {
    [key: string]: (...args: unknown[]) => void | any;
} = {};

export function handle(ipcMain: Electron.IpcMain) {
    for (const [key, handler] of Object.entries(handlers)) {
        ipcMain.handle(key, async () => handler());
    }
}

export class RemoteHandler extends Singleton<RemoteHandler>() {
    register(ipcMain: Electron.IpcMain) {
        for (const [key, handler] of Object.entries(handlers)) {
            ipcMain.handle(key, async (_, ...args: unknown[]) =>
                (handler as (...args: unknown[]) => unknown)(...args)
            );
        }
        for (const [key, listener] of Object.entries(listeners)) {
            ipcMain.on(key, async (_, ...args: unknown[]) =>
                (listener as (...args: unknown[]) => unknown)(...args)
            );
        }
    }
    off(ipcMain: Electron.IpcMain, key: keyof ExpectedHandler) {
        ipcMain.removeHandler(key);
    }
}
