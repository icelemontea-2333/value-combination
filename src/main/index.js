import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { AzCustomWindowMove } from './windowMove.ts';
import { loadConfigJson } from './readFile.js';

loadConfigJson()

//自定义窗口拖动
const CustomWindowMove = new AzCustomWindowMove();

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon,
    width: 300,
    height: 350,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  //窗体拖拽
  CustomWindowMove.init(mainWindow);

  // 通信监听
  ipcMain.on("Main_Window_Operate", (event, info) => {    
    const operateEvent = info.event || '';
    switch(operateEvent) {
        // 拖拽窗口-开始
        case 'homeDragWindowStart':
            CustomWindowMove.start();
            break;
        // 拖拽窗口-结束
        case 'homeDragWindowEnd':
            CustomWindowMove.end();
            break;
      default:
        break;
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setAlwaysOnTop(true, "screen-saver")
    mainWindow.setVisibleOnAllWorkspaces(true)
    uIOhook.on('keydown', (e) => {
      mainWindow.webContents.send('onkeydown-keyboard', e)
    })
    uIOhook.on('keyup', (e) => {
      mainWindow.webContents.send('onkeyup-keyboard', e)
    })

    uIOhook.start()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
