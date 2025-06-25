import { Download, Package, Trash2 } from 'lucide-react'
import { useServerData } from '../../hooks'
import {
  useDeleteDropinMod,
  useModsData,
  useToggleDropinMod,
  useToggleServerMod
} from '../../hooks/mods'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export default function ConfigMods() {
  const { currentServer } = useServerData()
  const modsQuery = useModsData()

  // Los datos ya vienen transformados por el select del hook
  const requiredMods = modsQuery.data?.requiredMods || []
  const optionalMods = modsQuery.data?.optionalMods || []
  const dropinMods = modsQuery.data?.dropinMods || []
  const modStats = modsQuery.data?.modStats || {
    total: 0,
    enabled: 0,
    disabled: 0,
    byExtension: {}
  }
  const isLoading = modsQuery.isLoading
  const toggleDropinMod = useToggleDropinMod()
  const deleteDropinMod = useDeleteDropinMod()
  const toggleServerMod = useToggleServerMod()

  const handleToggleDropinMod = (fullName: string, enabled: boolean) => {
    toggleDropinMod.mutate({ fullName, enable: enabled })
  }

  const handleDeleteDropinMod = (fullName: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este mod?')) {
      deleteDropinMod.mutate(fullName)
    }
  }

  const handleToggleServerMod = (modId: string, enabled: boolean) => {
    toggleServerMod.mutate({ modId, enabled })
  }

  if (isLoading) {
    return (
      <ConfigTab value="mods">
        <div className="flex flex-col h-full w-full gap-4">
          <ConfigTabHeader
            title="Mods"
            description="Configura los mods de Minecraft"
            Icon={Package}
          />
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Cargando información de mods...</span>
          </div>
        </div>
      </ConfigTab>
    )
  }

  return (
    <ConfigTab value="mods">
      <div className="flex flex-col h-full w-full gap-6">
        <ConfigTabHeader
          title="Mods"
          description={`Configura los mods para ${currentServer?.rawServer.name || 'el servidor actual'}`}
          Icon={Package}
        />

        {/* Información del servidor */}
        {currentServer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Servidor Actual</CardTitle>
              <CardDescription>
                {currentServer.rawServer.name} - {currentServer.rawServer.minecraftVersion}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Mods Obligatorios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mods Obligatorios
              <Badge variant="secondary">{requiredMods.length}</Badge>
            </CardTitle>
            <CardDescription>
              Estos mods son requeridos por el servidor y siempre están activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requiredMods.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay mods obligatorios para este servidor
              </p>
            ) : (
              <div className="space-y-3">
                {requiredMods.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {mod.name || 'NOMBRE VACÍO'}
                        </span>
                        <Badge variant="default" className="text-xs">
                          Requerido
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Versión: {mod.version}</p>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        Activo
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mods Opcionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mods Opcionales
              <Badge variant="secondary">{optionalMods.length}</Badge>
            </CardTitle>
            <CardDescription>
              Estos mods pueden activarse o desactivarse según tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optionalMods.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay mods opcionales disponibles para este servidor
              </p>
            ) : (
              <div className="space-y-3">
                {optionalMods.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {mod.name || 'NOMBRE VACÍO'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Opcional
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Versión: {mod.version}</p>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={mod.enabled}
                        onCheckedChange={(enabled) => handleToggleServerMod(mod.id, enabled)}
                        disabled={toggleServerMod.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mods Drop-in (Locales) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Mods Locales (Drop-in)
              <Badge variant="secondary">{dropinMods.length}</Badge>
            </CardTitle>
            <CardDescription>
              Mods agregados manualmente en la carpeta de mods local
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modStats && (
              <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                <span>Total: {modStats.total}</span>
                <span>Activos: {modStats.enabled}</span>
                <span>Inactivos: {modStats.disabled}</span>
              </div>
            )}

            {dropinMods.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-lg">
                <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground text-sm mb-2">No hay mods locales instalados</p>
                <p className="text-xs text-muted-foreground">
                  Arrastra archivos .jar a la carpeta de mods para agregar mods locales
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dropinMods.map((mod) => (
                  <div
                    key={mod.fullName}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{mod.name}</Label>
                        <Badge variant="outline" className="text-xs">
                          .{mod.ext}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{mod.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!mod.disabled}
                        onCheckedChange={(enabled) => handleToggleDropinMod(mod.fullName, enabled)}
                        disabled={toggleDropinMod.isPending}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDropinMod(mod.fullName)}
                        disabled={deleteDropinMod.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ConfigTab>
  )
}
