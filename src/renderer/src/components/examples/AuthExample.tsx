import {
  useAccounts,
  useAddMojangAccount,
  useAuthStatus,
  useLogout,
  useSelectAccount
} from '../../hooks/useAuth'
import { useAuth, useNotifications } from '../../stores/appStore'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function AuthExample() {
  // Usar el estado global
  const { user, isAuthenticated } = useAuth()
  const notifications = useNotifications()

  // Usar los hooks de React Query
  const { isLoading: statusLoading } = useAuthStatus()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const addMojangAccount = useAddMojangAccount()
  const selectAccount = useSelectAccount()
  const logout = useLogout()

  const handleAddAccount = () => {
    const username = prompt('Ingresa tu nombre de usuario:')
    if (username) {
      addMojangAccount.mutate(username)
    }
  }

  const handleSelectAccount = (uuid: string) => {
    selectAccount.mutate(uuid)
  }

  const handleLogout = () => {
    logout.mutate()
  }

  if (statusLoading || accountsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estado de autenticación...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
          <CardDescription>Estado actual del usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}
            </p>
            <p>
              <strong>Usuario:</strong> {user?.displayName || 'Ninguno'}
            </p>
            <p>
              <strong>Tipo:</strong> {user?.type || 'N/A'}
            </p>
            <p>
              <strong>UUID:</strong> {user?.uuid || 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Disponibles</CardTitle>
          <CardDescription>
            {accounts
              ? `${Object.keys(accounts).length} cuenta(s) encontrada(s)`
              : 'No hay cuentas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounts &&
              Object.values(accounts).map((account: any) => (
                <div
                  key={account.uuid}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{account.displayName}</p>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={user?.uuid === account.uuid ? 'default' : 'outline'}
                    onClick={() => handleSelectAccount(account.uuid)}
                    disabled={selectAccount.isPending}
                  >
                    {user?.uuid === account.uuid ? 'Seleccionada' : 'Seleccionar'}
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAddAccount} disabled={addMojangAccount.isPending}>
              {addMojangAccount.isPending ? 'Añadiendo...' : 'Añadir Cuenta Mojang'}
            </Button>

            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logout.isPending || !isAuthenticated}
            >
              {logout.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded text-sm ${
                    notification.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : notification.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : notification.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {notification.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
