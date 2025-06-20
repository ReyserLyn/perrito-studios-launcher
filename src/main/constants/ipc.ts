// Microsoft OAuth constants
export const AZURE_CLIENT_ID = 'client-id-here'

export const MSFT_OPCODE = {
  OPEN_LOGIN: 'MSFT_AUTH_OPEN_LOGIN',
  OPEN_LOGOUT: 'MSFT_AUTH_OPEN_LOGOUT',
  REPLY_LOGIN: 'MSFT_AUTH_REPLY_LOGIN',
  REPLY_LOGOUT: 'MSFT_AUTH_REPLY_LOGOUT'
} as const

export const MSFT_REPLY_TYPE = {
  SUCCESS: 'MSFT_AUTH_REPLY_SUCCESS',
  ERROR: 'MSFT_AUTH_REPLY_ERROR'
} as const

export const MSFT_ERROR = {
  ALREADY_OPEN: 'MSFT_AUTH_ERR_ALREADY_OPEN',
  NOT_FINISHED: 'MSFT_AUTH_ERR_NOT_FINISHED'
} as const

export const SHELL_OPCODE = {
  TRASH_ITEM: 'TRASH_ITEM'
} as const

export const AUTO_UPDATER = {
  INIT: 'autoUpdateAction',
  NOTIFICATION: 'autoUpdateNotification',
  ACTIONS: {
    INIT_AUTO_UPDATER: 'initAutoUpdater',
    CHECK_FOR_UPDATE: 'checkForUpdate',
    ALLOW_PRERELEASE_CHANGE: 'allowPrereleaseChange',
    INSTALL_UPDATE_NOW: 'installUpdateNow'
  }
} as const

export const DISTRIBUTION = {
  INDEX_DONE: 'distributionIndexDone'
} as const

export const DROPIN_MOD_OPCODE = {
  SCAN_MODS: 'dropin:scan-mods',
  ADD_MODS: 'dropin:add-mods',
  DELETE_MOD: 'dropin:delete-mod',
  TOGGLE_MOD: 'dropin:toggle-mod',
  SCAN_SHADERPACKS: 'dropin:scan-shaderpacks',
  GET_ENABLED_SHADERPACK: 'dropin:get-enabled-shaderpack',
  SET_ENABLED_SHADERPACK: 'dropin:set-enabled-shaderpack',
  ADD_SHADERPACKS: 'dropin:add-shaderpacks',
  GET_MOD_STATS: 'dropin:get-mod-stats'
} as const

export const DISCORD_RPC = {
  INIT: 'discord:init',
  UPDATE_DETAILS: 'discord:update-details',
  SHUTDOWN: 'discord:shutdown'
} as const

export const CONFIG_OPCODE = {
  GET_LAUNCHER_DIRECTORY: 'config:get-launcher-directory',
  GET_DATA_DIRECTORY: 'config:get-data-directory',
  SET_DATA_DIRECTORY: 'config:set-data-directory',
  GET_COMMON_DIRECTORY: 'config:get-common-directory',
  GET_INSTANCE_DIRECTORY: 'config:get-instance-directory',
  SAVE: 'config:save',
  LOAD: 'config:load',
  IS_FIRST_LAUNCH: 'config:is-first-launch',
  GET_GAME_WIDTH: 'config:get-game-width',
  SET_GAME_WIDTH: 'config:set-game-width',
  GET_GAME_HEIGHT: 'config:get-game-height',
  SET_GAME_HEIGHT: 'config:set-game-height',
  GET_FULLSCREEN: 'config:get-fullscreen',
  SET_FULLSCREEN: 'config:set-fullscreen',
  GET_AUTO_CONNECT: 'config:get-auto-connect',
  SET_AUTO_CONNECT: 'config:set-auto-connect',
  GET_LAUNCH_DETACHED: 'config:get-launch-detached',
  SET_LAUNCH_DETACHED: 'config:set-launch-detached',
  GET_ALLOW_PRERELEASE: 'config:get-allow-prerelease',
  SET_ALLOW_PRERELEASE: 'config:set-allow-prerelease',
  GET_SYNC_LANGUAGE: 'config:get-sync-language',
  SET_SYNC_LANGUAGE: 'config:set-sync-language',
  GET_SELECTED_SERVER: 'config:get-selected-server',
  SET_SELECTED_SERVER: 'config:set-selected-server',
  GET_MIN_RAM: 'config:get-min-ram',
  SET_MIN_RAM: 'config:set-min-ram',
  GET_MAX_RAM: 'config:get-max-ram',
  SET_MAX_RAM: 'config:set-max-ram',
  GET_JAVA_EXECUTABLE: 'config:get-java-executable',
  SET_JAVA_EXECUTABLE: 'config:set-java-executable',
  GET_JVM_OPTIONS: 'config:get-jvm-options',
  SET_JVM_OPTIONS: 'config:set-jvm-options',
  ENSURE_JAVA_CONFIG: 'config:ensure-java-config',
  GET_ABSOLUTE_MIN_RAM: 'config:get-absolute-min-ram',
  GET_ABSOLUTE_MAX_RAM: 'config:get-absolute-max-ram'
} as const

export const DISTRIBUTION_OPCODE = {
  GET_DISTRIBUTION: 'distro:get-distribution',
  REFRESH_DISTRIBUTION: 'distro:refresh-distribution',
  GET_SERVER_BY_ID: 'distro:get-server-by-id'
} as const

export const PROCESS_BUILDER_OPCODE = {
  LAUNCH_GAME: 'process:launch-game',
  KILL_PROCESS: 'process:kill-process',
  GET_PROCESS_STATUS: 'process:get-process-status'
} as const
