import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'
import { languageAPI } from './language'
import { authAPI } from './auth'
import { configAPI } from './config'
import { distributionAPI } from './distribution'
import { serverAPI } from './server'
import { processAPI } from './process'
import { launchAPI } from './launch'
import { modsAPI } from './mods'
import { discordAPI } from './discord'
import { updaterAPI } from './updater'
import { microsoftAuthAPI } from './microsoftAuth'
import { systemAPI } from './system'

const api = {
  auth: authAPI,
  config: configAPI,
  distribution: distributionAPI,
  process: processAPI,
  launch: launchAPI,
  mods: modsAPI,
  discord: discordAPI,
  language: languageAPI,
  updater: updaterAPI,
  microsoftAuth: microsoftAuthAPI,
  system: systemAPI,
  server: serverAPI
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
