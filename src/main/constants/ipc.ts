// Microsoft OAuth constants
export const AZURE_CLIENT_ID = '2f8e5a7e-eab6-4d49-8133-f82e7fb958a2'

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
  TRASH_ITEM: 'shell:trash-item',
  OPEN_FOLDER: 'shell:open-folder',
  SHOW_ITEM_IN_FOLDER: 'shell:show-item-in-folder',
  RESOLVE_FILE_PATH: 'shell:resolve-file-path',
  SELECT_JAVA_EXECUTABLE: 'shell:select-java-executable',
  SELECT_FOLDER: 'shell:select-folder',
  GET_SYSTEM_MEMORY: 'shell:get-system-memory'
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
  DISTRIBUTION_INDEX_DONE: 'distribution:index-done'
} as const

export const DISCORD_RPC = {
  INITIALIZE: 'discord-rpc:initialize',
  DESTROY: 'discord-rpc:destroy',
  UPDATE_ACTIVITY: 'discord-rpc:update-activity'
} as const

// ==== Comprobado ====

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
  GET_CURRENT_LANGUAGE: 'config:get-current-language',
  SET_LANGUAGE: 'config:set-language',
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
  GET_ABSOLUTE_MAX_RAM: 'config:get-absolute-max-ram',
  GET_MOD_CONFIGURATION: 'config:get-mod-configuration',
  SET_MOD_CONFIGURATION: 'config:set-mod-configuration'
} as const

export const DISTRIBUTION_OPCODE = {
  GET_DISTRIBUTION: 'distribution:get-distribution',
  GET_DISTRIBUTION_INDEX: 'distribution:get-distribution-index',
  GET_DISTRIBUTION_ASSET: 'distribution:get-distribution-asset'
} as const

export const PROCESS_BUILDER_OPCODE = {
  LAUNCH_GAME: 'process:launch-game',
  KILL_PROCESS: 'process:kill-process',
  GET_PROCESS_STATUS: 'process:get-process-status',
  VALIDATE_LAUNCH: 'process:validate-launch',
  SYSTEM_SCAN: 'process:system-scan',
  DOWNLOAD_JAVA: 'process:download-java',
  VALIDATE_AND_DOWNLOAD: 'process:validate-and-download',
  PREPARE_LAUNCH: 'process:prepare-launch'
} as const

export const SERVER_STATUS_OPCODE = {
  GET_STATUS: 'server:get-status',
  GET_PLAYER_COUNT: 'server:get-player-count',
  GET_PLAYER_LIST: 'server:get-player-list'
} as const

export const AUTH_OPCODE = {
  ADD_MOJANG_ACCOUNT: 'auth:add-mojang-account',
  REMOVE_MOJANG_ACCOUNT: 'auth:remove-mojang-account',
  ADD_MICROSOFT_ACCOUNT: 'auth:add-microsoft-account',
  REMOVE_MICROSOFT_ACCOUNT: 'auth:remove-microsoft-account',
  GET_SELECTED_ACCOUNT: 'auth:get-selected-account',
  GET_ALL_ACCOUNTS: 'auth:get-all-accounts',
  SELECT_ACCOUNT: 'auth:select-account',
  VALIDATE_SELECTED: 'auth:validate-selected',
  LOGOUT: 'auth:logout'
} as const

// Language
export const LANGUAGE = {
  CHANGE: 'language-change',
  GET_CURRENT: 'language-get-current',
  QUERY: 'language-query',
  PLURAL: 'language-plural',
  FORMAT_DATE: 'language-format-date',
  FORMAT_NUMBER: 'language-format-number',
  CHANGED: 'language-changed'
} as const
