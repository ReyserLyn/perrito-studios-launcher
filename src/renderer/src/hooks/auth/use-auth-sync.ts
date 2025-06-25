import { useEffect } from 'react'
import { useSelectedAccountQuery } from './use-auth'
import { useAuthStoreActions } from './use-auth-state'

/**
 * Hook que sincroniza React Query con el Zustand store
 * Debe ser usado en el componente raíz de la app
 */
export const useAuthSync = () => {
  const { data: selectedAccount, isLoading } = useSelectedAccountQuery()
  const { setUser, setAuthenticated } = useAuthStoreActions()

  // Sincronizar usuario seleccionado con el store
  useEffect(() => {
    if (selectedAccount) {
      setUser(selectedAccount)
      setAuthenticated(true)
    } else if (selectedAccount === null && !isLoading) {
      setUser(null)
      setAuthenticated(false)
    }
  }, [selectedAccount, isLoading, setUser, setAuthenticated])
}
