import { ipcRenderer } from 'electron'

export const discordAPI = {
  init: (genSettings: any, servSettings: any, initialDetails?: string) =>
    ipcRenderer.invoke('discord:init', genSettings, servSettings, initialDetails),
  updateDetails: (details: string) => ipcRenderer.invoke('discord:update-details', details),
  shutdown: () => ipcRenderer.invoke('discord:shutdown')
}
