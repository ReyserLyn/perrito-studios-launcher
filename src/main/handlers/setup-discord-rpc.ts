import { ipcMain } from 'electron'
import { DISCORD_RPC } from '../constants/ipc'
import * as DiscordWrapper from '../services/discordwrapper'

export default function setupDiscordRpcHandlers(): void {
  ipcMain.handle(
    DISCORD_RPC.INITIALIZE,
    async (_, genSettings = {}, servSettings = {}, initialDetails?: string) => {
      try {
        await DiscordWrapper.initialize(genSettings, servSettings, initialDetails)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle(DISCORD_RPC.DESTROY, async () => {
    try {
      await DiscordWrapper.destroy()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(DISCORD_RPC.UPDATE_ACTIVITY, async (_, activity) => {
    try {
      await DiscordWrapper.updateActivity(activity)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
