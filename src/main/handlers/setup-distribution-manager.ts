import { ipcMain } from 'electron'
import { DISTRIBUTION_OPCODE } from '../constants/ipc'
import { distroAPI } from '../services/distributionManager'

export default function setupDistributionHandlers(): void {
  // Obtener distribución
  ipcMain.handle(DISTRIBUTION_OPCODE.GET_DISTRIBUTION, async () => {
    try {
      const distribution = await distroAPI.getDistribution()
      return {
        success: true,
        distribution
      }
    } catch (error) {
      console.error('Error obteniendo distribución:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo distribución'
      }
    }
  })
}
