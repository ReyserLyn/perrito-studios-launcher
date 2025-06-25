import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'

// ===== HOOKS PARA CONSULTAS =====

/**
 * Hook para obtener todas las cuentas desde la API
 * No actualiza el store, solo retorna los datos
 */
export const useAccountsQuery = () => {
  return useQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => {
      const result = await window.api.auth.getAllAccounts()
      if (result.success) {
        return result.accounts
      }
      throw new Error(result.error || 'Error obteniendo cuentas')
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1
  })
}

/**
 * Hook para obtener la cuenta seleccionada desde la API
 * No actualiza el store, solo retorna los datos
 */
export const useSelectedAccountQuery = () => {
  return useQuery({
    queryKey: queryKeys.auth.selectedAccount,
    queryFn: async () => {
      const result = await window.api.auth.getSelectedAccount()
      if (result.success) {
        return result.account
      }
      return null
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1
  })
}

/**
 * Hook principal que combina las consultas de auth
 * Retorna datos procesados pero NO actualiza el store
 */
export const useAuthData = () => {
  const accountsQuery = useAccountsQuery()
  const selectedAccountQuery = useSelectedAccountQuery()
  const accountsList = accountsQuery.data ? Object.values(accountsQuery.data) : []

  // Estados derivados
  const hasAccounts = accountsQuery.data && Object.keys(accountsQuery.data).length > 0
  const hasSelectedAccount = !!selectedAccountQuery.data
  const isLoading = accountsQuery.isLoading || (hasAccounts && selectedAccountQuery.isLoading)

  const microsoftAccounts = accountsList.filter((account) => account.type === 'microsoft')
  const mojangAccounts = accountsList.filter((account) => account.type === 'mojang')

  return {
    // Estados de carga
    isLoading,
    isError: accountsQuery.isError || selectedAccountQuery.isError,

    // Estados derivados
    hasAccounts,
    hasSelectedAccount,

    // Datos procesados
    accounts: accountsList,
    selectedAccount: selectedAccountQuery.data,

    // Datos derivados
    microsoftAccounts,
    mojangAccounts,

    // Funciones de refetch
    refetchAccounts: accountsQuery.refetch,
    refetchSelectedAccount: selectedAccountQuery.refetch
  }
}

// ===== HOOKS DE MUTACIONES =====

/**
 * Hook para añadir cuenta Mojang
 */
export const useAddMojangAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (username: string) => {
      // Verificar duplicados
      const accountsResult = await window.api.auth.getAllAccounts()
      if (accountsResult.success && accountsResult.accounts) {
        const existingAccounts = Object.values(accountsResult.accounts)
        const duplicateAccount = existingAccounts.find(
          (account) => account.displayName.toLowerCase() === username.toLowerCase()
        )

        if (duplicateAccount) {
          throw new Error(
            `El nombre de usuario "${username}" ya está en uso. Por favor ingresa otro nombre o revisa las cuentas cargadas.`
          )
        }
      }

      const result = await window.api.auth.addMojangAccount(username)
      if (!result.success) {
        throw new Error(result.error || 'Error añadiendo cuenta Mojang')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      toast.success('Cuenta Mojang añadida exitosamente')
    },
    onError: (error: Error) => {
      console.error(`[useAddMojangAccount] Error:`, error)
      toast.error(error.message)
    }
  })
}

/**
 * Hook para añadir cuenta Microsoft
 */
export const useAddMicrosoftAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (authCode: string) => {
      const result = await window.api.auth.addMicrosoftAccount(authCode)
      if (!result.success) {
        throw new Error(result.error || 'Error añadiendo cuenta Microsoft')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      toast.success('Cuenta Microsoft añadida exitosamente')
    },
    onError: (error: Error) => {
      console.error('[useAddMicrosoftAccount] Error:', error)
      toast.error(error.message)
    }
  })
}

/**
 * Hook para seleccionar cuenta
 */
export const useSelectAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuid: string) => {
      const result = await window.api.auth.selectAccount(uuid)
      if (!result.success) {
        throw new Error(result.error || 'Error seleccionando cuenta')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      toast.success('Cuenta seleccionada exitosamente')
    },
    onError: (error: Error) => {
      console.error(`[useSelectAccount] Error:`, error)
      toast.error(error.message)
    }
  })
}

/**
 * Hook para cerrar sesión
 */
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await window.api.auth.logout()
      if (!result.success) {
        throw new Error(result.error || 'Error cerrando sesión')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      toast.success('Sesión cerrada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Hook para eliminar cuenta
 */
export const useRemoveAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { uuid: string; type: 'microsoft' | 'mojang' }) => {
      const { uuid, type } = params
      if (type === 'microsoft') {
        return await window.api.auth.removeMicrosoftAccount(uuid)
      }
      return await window.api.auth.removeMojangAccount(uuid)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      toast.success('Cuenta eliminada exitosamente')
    },
    onError: (error: Error) => {
      console.error('[useRemoveAccount] Error:', error)
      toast.error(error.message)
    }
  })
}
