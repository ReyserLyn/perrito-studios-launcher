import { useState } from 'react'
import {
  useAccounts,
  useAddMojangAccount,
  useAuthStatus,
  useLogout,
  useSelectAccount
} from '../../hooks/useAuth'
import { useAuth } from '../../stores/appStore'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function AuthExample() {
  // Estado para el diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [username, setUsername] = useState('')

  // Usar el estado global
  const { user, isAuthenticated } = useAuth()

  // Usar los hooks de React Query
  const { isLoading: statusLoading } = useAuthStatus()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const addMojangAccount = useAddMojangAccount()
  const selectAccount = useSelectAccount()
  const logout = useLogout()

  const handleConfirmAddAccount = () => {
    console.log('[AuthExample] Username ingresado:', username)
    if (username.trim()) {
      console.log('[AuthExample] Ejecutando mutación addMojangAccount')
      addMojangAccount.mutate(username.trim())
      setUsername('')
      setIsDialogOpen(false)
    } else {
      console.log('[AuthExample] No se ingresó username válido, cancelando')
    }
  }

  const handleCancelAddAccount = () => {
    console.log('[AuthExample] Cancelando añadir cuenta')
    setUsername('')
    setIsDialogOpen(false)
  }

  const handleSelectAccount = (uuid: string) => {
    console.log('[AuthExample] Seleccionando cuenta:', uuid)
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={addMojangAccount.isPending}>
                  {addMojangAccount.isPending ? 'Añadiendo...' : 'Añadir Cuenta Mojang'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Añadir Cuenta Mojang</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Nombre de usuario
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                      placeholder="Ingresa tu nombre de usuario"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConfirmAddAccount()
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelAddAccount}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmAddAccount} disabled={!username.trim()}>
                    Añadir
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

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
    </div>
  )
}
