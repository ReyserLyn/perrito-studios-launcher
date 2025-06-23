import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// Hook para obtener todas las cuentas
export const useAccounts = () => {
  const { setAccounts } = useAppStore()

  return useQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => {
      const result = await window.api.auth.getAllAccounts()
      if (result.success) {
        setAccounts(Object.values(result.accounts))
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

  return useMutation({
    mutationFn: async (username: string) => {
      console.log(`[useAddMojangAccount] Iniciando solicitud para: ${username}`)
      const result = await window.api.auth.addMojangAccount(username)
      console.log(`[useAddMojangAccount] Resultado recibido:`, result)
      if (!result.success) {
        throw new Error(result.error || 'Error añadiendo cuenta Mojang')
      }
      return result
    },
    onSuccess: () => {
      console.log(`[useAddMojangAccount] Mutación exitosa, invalidando queries`)
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })

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
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })

      toast.success('Cuenta Microsoft añadida exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para seleccionar cuenta
export const useSelectAccount = () => {
  const queryClient = useQueryClient()
  const { setUser, setAuthenticated } = useAppStore()

  return useMutation({
    mutationFn: async (uuid: string) => {
      console.log(`[useSelectAccount] Seleccionando cuenta: ${uuid}`)
      const result = await window.api.auth.selectAccount(uuid)
      console.log(`[useSelectAccount] Resultado:`, result)
      if (!result.success) {
        throw new Error(result.error || 'Error seleccionando cuenta')
      }
      return result
    },
    onSuccess: (data) => {
      console.log(`[useSelectAccount] Cuenta seleccionada exitosamente:`, data.account)
      if (data.account) {
        // Actualizar el estado del store inmediatamente
        setUser({
          uuid: data.account.uuid,
          displayName: data.account.displayName,
          type: data.account.type
        })
        setAuthenticated(true)

        // Invalidar queries para refrescar datos
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.selectedAccount })
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.status })
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.accounts })
      }

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
  const { setUser, setAuthenticated } = useAppStore()

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

      toast.success('Sesión cerrada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para validar cuenta seleccionada
export const useValidateAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await window.api.auth.validateSelected()
      if (!result.success) {
        throw new Error(result.error || 'Error validando cuenta')
      }
      return result.isValid
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
