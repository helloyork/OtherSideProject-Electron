import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { RemoteHandler } from './app/mainHandler'

const WIDTH = 1440;
const HEIGHT = 900;
const aspectRatio = WIDTH / HEIGHT;

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
  });
  mainWindow.setMenu(null);
  mainWindow.setAspectRatio(aspectRatio);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setMinimumSize(WIDTH / 2, HEIGHT / 2);
    zoom();
  });
  mainWindow.on('resize', () => {
    zoom();
  });
  function zoom() {
    let { width, height } = mainWindow.getBounds();
    let zoomFactor = Math.min(width / WIDTH, height / HEIGHT);
    mainWindow.webContents.setZoomFactor(zoomFactor);
  }

  RemoteHandler.getInstance().register(ipcMain, mainWindow);

  if (isProd) {
    await mainWindow.loadURL('app://./')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
});
