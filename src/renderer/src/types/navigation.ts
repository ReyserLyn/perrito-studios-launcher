export enum AppScreen {
  Login = 'login',
  AccountsAvailable = 'accounts-available',
  Home = 'home',
  ConfigManager = 'config-manager'
}

export type NavigationState = {
  screen: AppScreen
  configTab?: string
}
