import type { ExpectedHandler, ExpectedListener } from "../preload";
import { Singleton } from "../util/singleton";

type Handlers = {
    [K in keyof ExpectedHandler]: (ctx: {
        event: Electron.IpcMainInvokeEvent;
        mainWindow: Electron.BrowserWindow;
    }, ...args: unknown[]) => Promise<ExpectedHandler[K]> | ExpectedHandler[K];
};
type Listeners = {
    [K in keyof ExpectedListener]: (ctx: {
        event: Electron.IpcMainInvokeEvent;
        mainWindow: Electron.BrowserWindow;
    }, ...args: unknown[]) => void;
};

const handlers: Handlers = {
    hello: (...args) => [...args],
};
const listeners: Listeners = {
    "window:minimize": async ({ mainWindow }) => {
        mainWindow.minimize();
    },
    "window:maximize": async ({ mainWindow }) => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    },
    "window:close": async ({ mainWindow }) => {
        mainWindow.close();
    }
};


export class RemoteHandler extends Singleton<RemoteHandler>() {
    register(ipcMain: Electron.IpcMain, mainWindow: Electron.BrowserWindow) {
        for (const [key, handler] of Object.entries(handlers)) {
            ipcMain.handle(key, async (_, ...args: unknown[]) =>
                (handler as (...args: unknown[]) => unknown)(...args)
            );
        }
        for (const [key, listener] of Object.entries(listeners)) {
            ipcMain.on(key, async (event, ...args: unknown[]) =>
                (listener as (...args: unknown[]) => unknown)({
                    event,
                    mainWindow: mainWindow
                }, ...args)
            );
        }
    }
    off(ipcMain: Electron.IpcMain, key: keyof ExpectedHandler) {
        ipcMain.removeHandler(key);
    }
    on(ipcMain: Electron.IpcMain, key: string, listener: (events: Electron.IpcMainInvokeEvent, ...args: unknown[]) => void) {
        return ipcMain.on(key, listener);
    }
}
