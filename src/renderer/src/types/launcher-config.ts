export type Language = 'es_ES' | 'en_US'

export interface LauncherConfigData {
  currentLanguage: Language
  allowPrerelease: boolean
  dataDirectory: string
}

export interface LauncherConfigState extends LauncherConfigData {
  // Loading states
  isLoadingLanguage: boolean
  isLoadingPrerelease: boolean
  isLoadingDataDirectory: boolean
  isLoading: boolean
  isSelectingDirectory: boolean

  // Mutation states
  isChangingLanguage: boolean
  isChangingPrerelease: boolean
  isChangingDataDirectory: boolean
}

export interface LauncherConfigActions {
  handleLanguageChange: (language: Language) => void
  handlePrereleaseChange: (enabled: boolean) => void
  handleSelectDataDirectory: () => Promise<void>
}

export interface LauncherConfigErrors {
  language: Error | null
  prerelease: Error | null
  dataDirectory: Error | null
}

export interface LauncherConfigReturn extends LauncherConfigState, LauncherConfigActions {
  errors: LauncherConfigErrors
}
