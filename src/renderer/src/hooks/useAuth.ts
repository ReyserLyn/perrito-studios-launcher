import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// Hook para obtener el estado de autenticación
export const useAuthStatus = () => {
  const { setUser, setAuthenticated } = useAppStore()

  return useQuery({
    queryKey: queryKeys.auth.status,
    queryFn: async () => {
      const result = await window.api.auth.checkStatus()
      if (result.success) {
        setUser(result.user)
        setAuthenticated(!!result.user)
        return result
      }
      throw new Error(result.error || 'Error verificando estado de autenticación')
    },
    refetchInterval: 30000 // Verificar cada 30 segundos
  })
}

// Hook para obtener todas las cuentas
export const useAccounts = () => {
  const { setAccounts } = useAppStore()

  return useQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => {
      const result = await window.api.auth.getAllAccounts()
      if (result.success) {
        setAccounts(result.accounts ? Object.values(result.accounts) : [])
        return result.accounts
      }
      throw new Error(result.error || 'Error obteniendo cuentas')
    }
  })
}

// Hook para obtener cuenta seleccionada
export const useSelectedAccount = () => {
  return useQuery({
    queryKey: queryKeys.auth.selectedAccount,
    queryFn: async () => {
      const result = await window.api.auth.getSelectedAccount()
      if (result.success) {
        return result.account
      }
      throw new Error(result.error || 'Error obteniendo cuenta seleccionada')
    }
  })
}

// Hook para añadir cuenta Mojang
export const useAddMojangAccount = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useAppStore()

  return useMutation({
    mutationFn: async (username: string) => {
      const result = await window.api.auth.addMojangAccount(username)
      if (!result.success) {
        throw new Error(result.error || 'Error añadiendo cuenta Mojang')
      }
      return result
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })

      addNotification({
        type: 'success',
        message: 'Cuenta Mojang añadida exitosamente'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para añadir cuenta Microsoft
export const useAddMicrosoftAccount = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useAppStore()

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
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })

      addNotification({
        type: 'success',
        message: 'Cuenta Microsoft añadida exitosamente'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para seleccionar cuenta
export const useSelectAccount = () => {
  const queryClient = useQueryClient()
  const { addNotification, setUser } = useAppStore()

  return useMutation({
    mutationFn: async (uuid: string) => {
      const result = await window.api.auth.selectAccount(uuid)
      if (!result.success) {
        throw new Error(result.error || 'Error seleccionando cuenta')
      }
      return result
    },
    onSuccess: (data) => {
      setUser(data.account)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })

      addNotification({
        type: 'success',
        message: 'Cuenta seleccionada exitosamente'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para cerrar sesión
export const useLogout = () => {
  const queryClient = useQueryClient()
  const { addNotification, setUser, setAuthenticated } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      const result = await window.api.auth.logout()
      if (!result.success) {
        throw new Error(result.error || 'Error cerrando sesión')
      }
      return result
    },
    onSuccess: () => {
      setUser(null)
      setAuthenticated(false)

      // Limpiar todas las queries de auth
      queryClient.removeQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.removeQueries({ queryKey: queryKeys.auth.selectedAccount })
      queryClient.removeQueries({ queryKey: queryKeys.auth.status })

      addNotification({
        type: 'success',
        message: 'Sesión cerrada exitosamente'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para validar cuenta seleccionada
export const useValidateAccount = () => {
  const { addNotification } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      const result = await window.api.auth.validateSelected()
      if (!result.success) {
        throw new Error(result.error || 'Error validando cuenta')
      }
      return result.isValid
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}
