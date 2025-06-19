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
