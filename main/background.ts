import path from 'path';
import { app, ipcMain, globalShortcut } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { RemoteHandler } from './app/mainHandler';

const WIDTH = 1920 * 0.75;
const HEIGHT = 1080 * 0.75;
const aspectRatio = WIDTH / HEIGHT;

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' })
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

function zoom(mainWindow: Electron.CrossProcessExports.BrowserWindow) {
    let { width, height } = mainWindow.getBounds();
    let zoomFactor = Math.min(width / WIDTH, height / HEIGHT);
    mainWindow.webContents.setZoomFactor(zoomFactor);
}

; (async () => {
    await app.whenReady();

    const mainWindow = createWindow('main', {
        width: WIDTH,
        height: HEIGHT,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        useContentSize: true,
    });
    mainWindow.setMenu(null);
    // mainWindow.setAspectRatio(aspectRatio);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setMinimumSize(WIDTH / 3, HEIGHT / 3);
        zoom(mainWindow);
    });
    mainWindow.on('resize', () => {
        zoom(mainWindow);
    });

    RemoteHandler.getInstance().register(ipcMain, mainWindow);
    
    if (!isProd) {
        mainWindow.webContents.on('before-input-event', (_, input) => {
            if (input.key === 'F12') {
                mainWindow.webContents.openDevTools();
            }
        });
    }

    if (isProd) {
        await mainWindow.loadURL('app://./')
    } else {
        const port = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${port}/`)
    }
})();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

ipcMain.on('message', async (event, arg) => {
    event.reply('message', `${arg} World!`)
});
