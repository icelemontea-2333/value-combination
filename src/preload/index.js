import { contextBridge,ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onkeydownKeyboard: (callback) => ipcRenderer.on('onkeydown-keyboard', callback),
  onkeyupKeyboard: (callback) => ipcRenderer.on('onkeyup-keyboard', callback),
  writeConfig: (callback) => ipcRenderer.invoke('write-config', callback),
  loadConfig: (callback) => ipcRenderer.invoke('load-config', callback),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('customAPI', {
      //window拖拽
      publishMainWindowOperateMessage: (info) => {
        ipcRenderer.send("Main_Window_Operate", info);
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  console.log(window)
}
