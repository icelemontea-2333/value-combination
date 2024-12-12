import { app, shell, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { AzCustomWindowMove } from './windowMove.ts';
import { loadConfigJson,writeConfigJson } from './readFile.js';

//自定义窗口拖动
const CustomWindowMove = new AzCustomWindowMove();

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon,
    width: 200,
    height: 250,
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

  //新建图标对象
  const tray = new Tray(icon);
  
  //新建菜单内容
  const trayContextMenu = Menu.buildFromTemplate([{
      label: '退出',
          click: () => {
            app.quit();
            //退出的方法
          }
      }
  ]);
  
  //单击左键触发
  tray.on('click', () => {
      //显示窗口的方法
  });
  
  //单机右键触发
  tray.on('right-click', () => {
      //显示菜单列表
      tray.popUpContextMenu(trayContextMenu);
  });

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

  //写入配置
  ipcMain.handle('write-config',(event,data)=>{
    writeConfigJson(data);
  })

  //加载配置
  ipcMain.handle('load-config',(event)=>{
    return loadConfigJson();
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setAlwaysOnTop(true, "screen-saver")
    mainWindow.setVisibleOnAllWorkspaces(true)
    //初始位置
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    mainWindow.setBounds({
      x: width - 225,
      y: height - 305,
    })
    //键盘事件
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
