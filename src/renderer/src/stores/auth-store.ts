import { AuthAccount } from '@/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AuthState {
  user: AuthAccount | null
  isAuthenticated: boolean

  // Acciones
  setUser: (user: AuthAccount | null) => void
  setAuthenticated: (authenticated: boolean) => void
  logout: () => void
  reset: () => void
}

const initialAuthState = {
  user: null,
  isAuthenticated: false
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialAuthState,

        // Acciones
        setUser: (user) =>
          set(
            (state) => ({
              ...state,
              user,
              isAuthenticated: !!user
            }),
            false,
            'setUser'
          ),

        setAuthenticated: (authenticated) =>
          set(
            (state) => ({
              ...state,
              isAuthenticated: authenticated
            }),
            false,
            'setAuthenticated'
          ),

        logout: () =>
          set(
            {
              user: null,
              isAuthenticated: false
            },
            false,
            'logout'
          ),

        reset: () => set(initialAuthState, false, 'resetAuth')
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'AuthStore'
    }
  )
)
