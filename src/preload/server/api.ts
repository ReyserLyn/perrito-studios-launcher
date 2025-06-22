import { ipcRenderer } from 'electron'
import { SERVER_STATUS_OPCODE } from '../../main/constants/ipc'

export const serverAPI = {
  getStatus: (hostname: string, port: number) =>
    ipcRenderer.invoke(SERVER_STATUS_OPCODE.GET_STATUS, hostname, port)
}
