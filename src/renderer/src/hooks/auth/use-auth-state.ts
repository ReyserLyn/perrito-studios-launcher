import { useAuthStore } from '../../stores/auth-store'

/**
 * Hook para obtener solo el usuario actual
 * @returns Usuario autenticado o null
 */
export const useCurrentUser = () => useAuthStore((state) => state.user)

/**
 * Hook para obtener solo el estado de autenticación
 * @returns Boolean indicando si está autenticado
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)

/**
 * Hook para obtener el estado completo de autenticación
 * @returns Estado completo de auth (user, isAuthenticated)
 */
export const useAuthState = () =>
  useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }))

/**
 * Hook para obtener todas las acciones de autenticación
 * @returns Acciones para manejar el estado de auth
 */
export const useAuthStoreActions = () => {
  const store = useAuthStore()
  return {
    setUser: store.setUser,
    setAuthenticated: store.setAuthenticated,
    logout: store.logout,
    reset: store.reset
  }
}
