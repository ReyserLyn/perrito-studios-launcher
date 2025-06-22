import { ipcMain } from 'electron'
import { getServerStatus } from 'perrito-core/mojang'
import { SERVER_STATUS_OPCODE } from '../constants/ipc'

export default function setupServerStatusHandlers(): void {
  // Obtener estado del servidor
  ipcMain.handle(
    SERVER_STATUS_OPCODE.GET_STATUS,
    async (_event, hostname: string, port: number) => {
      try {
        const servStat = await getServerStatus(47, hostname, port)

        return {
          success: true,
          status: {
            status: 'online',
            players: {
              online: servStat.players.online,
              max: servStat.players.max,
              label: `${servStat.players.online}/${servStat.players.max} jugadores conectados`
            },
            version: servStat.version?.name || 'Desconocido',
            motd: servStat.description?.text || 'Servidor en línea'
          }
        }
      } catch (error) {
        console.warn(`Unable to connect to server ${hostname}:${port}, assuming offline.`, error)

        return {
          success: true,
          status: {
            status: 'offline',
            players: {
              online: 0,
              max: 0,
              label: 'Fuera de línea'
            },
            version: 'Desconocido',
            motd: 'Servidor fuera de línea'
          }
        }
      }
    }
  )
}
