import { ipcRenderer } from 'electron'
import { DISTRIBUTION_OPCODE } from '../../main/constants/ipc'

export const distributionAPI = {
  getDistribution: () => ipcRenderer.invoke(DISTRIBUTION_OPCODE.GET_DISTRIBUTION)
}
