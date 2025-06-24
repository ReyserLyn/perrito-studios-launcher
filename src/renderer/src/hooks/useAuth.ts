import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// ===== HOOK PRINCIPAL PARA ESTADO DE AUTENTICACIÓN =====
export const useAuthStatus = () => {
  const { setUser, setAuthenticated, setAccounts } = useAppStore()

  // Query para obtener todas las cuentas
  const accountsQuery = useQuery({
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

  // Query para obtener cuenta seleccionada
  const selectedAccountQuery = useQuery({
    queryKey: queryKeys.auth.selectedAccount,
    queryFn: async () => {
      const result = await window.api.auth.getSelectedAccount()
      if (result.success) {
        return result.account
      }
      // Si no hay cuenta seleccionada, no es un error
      return null
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1
  })

  // Actualizar store cuando cambien las cuentas
  useEffect(() => {
    if (accountsQuery.data) {
      const accountsArray = Object.values(accountsQuery.data)
      setAccounts(accountsArray)
    } else {
      // Si no hay cuentas, limpiar el array en el store
      setAccounts([])
    }
  }, [accountsQuery.data, selectedAccountQuery.data, selectedAccountQuery.isLoading, setAccounts])

  // Actualizar store cuando cambie la cuenta seleccionada
  useEffect(() => {
    const user = selectedAccountQuery.data

    if (user) {
      setUser(user)
      setAuthenticated(true)
    } else if (user === null && !selectedAccountQuery.isLoading) {
      setUser(null)
      setAuthenticated(false)
    }
  }, [selectedAccountQuery.data, selectedAccountQuery.isLoading, setUser, setAuthenticated])

  // Estados derivados
  const hasAccounts = accountsQuery.data && Object.keys(accountsQuery.data).length > 0
  const hasSelectedAccount = !!selectedAccountQuery.data
  const isLoading = accountsQuery.isLoading || (hasAccounts && selectedAccountQuery.isLoading)

  return {
    // Estados
    hasAccounts,
    hasSelectedAccount,
    isLoading,
    isError: accountsQuery.isError || selectedAccountQuery.isError,

    // Datos
    accounts: accountsQuery.data,
    selectedAccount: selectedAccountQuery.data,
    accountsList: accountsQuery.data ? Object.values(accountsQuery.data) : [],

    // Funciones de refetch
    refetchAccounts: accountsQuery.refetch,
    refetchSelectedAccount: selectedAccountQuery.refetch,

    // Función para refrescar todo el estado de auth
    refetchAll: () => {
      accountsQuery.refetch()
      selectedAccountQuery.refetch()
    }
  }
}

// ===== HOOKS DE MUTACIONES =====

// Hook para añadir cuenta Mojang
export const useAddMojangAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (username: string) => {
      // Verificar si el username ya existe en las cuentas cargadas
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
      console.error(`[useAddMojangAccount] Error en mutación:`, error)
      toast.error(error.message)
    }
  })
}

// Hook para añadir cuenta Microsoft
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
      console.error('[useAddMicrosoftAccount] Error completo:', error)
      toast.error(error.message)
    }
  })
}

// Hook para seleccionar cuenta
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
      console.error(`[useSelectAccount] Error en mutación:`, error)
      toast.error(error.message)
    }
  })
}

// Hook para cerrar sesión
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
