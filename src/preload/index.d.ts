import { ElectronAPI } from '@electron-toolkit/preload'
import LanguageAPI from './language/types'
import AuthAPI from './auth/types'
import ConfigAPI from './config/types'
import DistributionAPI from './distribution/types'
import ServerAPI from './server/types'
import ProcessAPI from './process/types'
import LaunchAPI from './launch/types'
import ModsAPI from './mods/types'
import DiscordAPI from './discord/types'
import UpdaterAPI from './updater/types'
import MicrosoftAuthAPI from './microsoftAuth/types'
import SystemAPI from './system/types'

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
