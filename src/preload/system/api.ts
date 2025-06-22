import { ipcRenderer } from 'electron'

export const systemAPI = {
  trashItem: (filePath: string) => ipcRenderer.invoke('TRASH_ITEM', filePath),

  // Distribution events
  onDistributionIndexDone: (callback: (result: boolean) => void) => {
    ipcRenderer.on('distributionIndexDone', (_, result) => callback(result))
  },
  removeDistributionListener: () => {
    ipcRenderer.removeAllListeners('distributionIndexDone')
  }
}
