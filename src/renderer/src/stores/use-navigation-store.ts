import { AppScreen } from '@/types/navigation'
import { create } from 'zustand'

type NavigationStore = {
  screen: AppScreen
  configTab: string
  showSplash: boolean

  goTo: (screen: AppScreen) => void
  goToConfig: (tab?: string) => void
  backToHome: () => void
  hideSplash: () => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  screen: AppScreen.Login,
  configTab: 'account',
  showSplash: true,

  goTo: (screen) => set({ screen }),
  goToConfig: (tab = 'account') => set({ screen: AppScreen.ConfigManager, configTab: tab }),
  backToHome: () => set({ screen: AppScreen.Home }),
  hideSplash: () => set({ showSplash: false })
}))
