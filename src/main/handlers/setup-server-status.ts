import { ipcMain } from 'electron'
import { getServerStatus } from 'perrito-core/mojang'
import { SERVER_STATUS_OPCODE } from '../constants/ipc'

export default function setupServerStatusHandlers(): void {
  // Obtener estado del servidor
  ipcMain.handle(
    SERVER_STATUS_OPCODE.GET_STATUS,
    async (_event, hostname: string, port: number) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        })

        const servStat = await Promise.race([getServerStatus(47, hostname, port), timeoutPromise])

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
        if (error instanceof Error && !error.message.includes('timeout')) {
          console.warn(`Server ${hostname}:${port} offline:`, error.message.substring(0, 100))
        }

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
