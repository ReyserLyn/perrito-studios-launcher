import { ElectronAPI } from '@electron-toolkit/preload'
import type AuthAPI from './auth/types'
import type ConfigAPI from './config/types'
import type DiscordAPI from './discord/types'
import type DistributionAPI from './distribution/types'
import type LanguageAPI from './language/types'
import type LaunchAPI from './launch/types'
import type MicrosoftAuthAPI from './microsoftAuth/types'
import type ModsAPI from './mods/types'
import type ProcessAPI from './process/types'
import type ServerAPI from './server/types'
import type SystemAPI from './system/types'
import type UpdaterAPI from './updater/types'

interface API {
  auth: AuthAPI
  config: ConfigAPI
  distribution: DistributionAPI
  process: ProcessAPI
  launch: LaunchAPI
  mods: ModsAPI
  discord: DiscordAPI
  language: LanguageAPI
  updater: UpdaterAPI
  microsoftAuth: MicrosoftAuthAPI
  system: SystemAPI
  server: ServerAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
