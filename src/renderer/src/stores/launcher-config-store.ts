import { create } from 'zustand'

interface LauncherConfigState {
  isSelectingDirectory: boolean
}

interface LauncherConfigActions {
  setIsSelectingDirectory: (isSelecting: boolean) => void
}

export const useLauncherConfigStore = create<LauncherConfigState & LauncherConfigActions>(
  (set) => ({
    isSelectingDirectory: false,
    setIsSelectingDirectory: (isSelecting) => set({ isSelectingDirectory: isSelecting })
  })
)
