import { useServerData } from '@/hooks'
import { DndContext } from '@dnd-kit/core'
import { FolderOpen, Package, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { useModsDragDrop } from '../../hooks/drag-drop'
import { useDeleteDropinMod, useModsData, useToggleDropinMod } from '../../hooks/mods'
import { useOpenFolder } from '../../hooks/use-file-system'
import { getModsDirectory } from '../../utils/mods'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

export function DropInModsSection() {
  const { currentServer } = useServerData()
  const modsQuery = useModsData()
  const dropinMods = modsQuery.data?.dropinMods || []
  const modStats = modsQuery.data?.modStats || {
    total: 0,
    enabled: 0,
    disabled: 0,
    byExtension: {}
  }

  const toggleDropinMod = useToggleDropinMod()
  const deleteDropinMod = useDeleteDropinMod()
  const openFolder = useOpenFolder()

  // Configurar drag & drop
  const { isDragActive, isUploading, nativeDropProps, DndContextProps } = useModsDragDrop()

  const handleToggleDropinMod = useCallback(
    (fullName: string, enabled: boolean) => {
      toggleDropinMod.mutate({ fullName, enable: enabled })
    },
    [toggleDropinMod]
  )

  const handleDeleteDropinMod = useCallback(
    (fullName: string) => {
      if (confirm('¿Estás seguro de que deseas eliminar este mod?')) {
        deleteDropinMod.mutate(fullName)
      }
    },
    [deleteDropinMod]
  )

  const handleOpenModsFolder = useCallback(async () => {
    if (!currentServer) return

    try {
      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      openFolder.mutate(modsDir)
    } catch (error) {
      console.error('Error obteniendo directorio de mods:', error)
    }
  }, [currentServer, openFolder])

  const handleRefreshMods = useCallback(() => {
    modsQuery.refetch()
  }, [modsQuery])

  const isEmpty = dropinMods.length === 0
  const hasStats = modStats.total > 0

  return (
    <DndContext {...DndContextProps}>
      <Card className="border-[#2c1e4d] bg-[#151126]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="w-5 h-5 text-purple-400" />
            Mods Locales (Drop-in)
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {dropinMods.length}
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Administra tus mods locales arrastrando archivos .jar, .zip o .litemod
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estadísticas */}
          {hasStats && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-[#1d1332] rounded-lg border border-[#2c1e4d]">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{modStats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{modStats.enabled}</div>
                <div className="text-xs text-gray-400">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{modStats.disabled}</div>
                <div className="text-xs text-gray-400">Inactivos</div>
              </div>
            </div>
          )}

          {/* Zona de Drag & Drop / Estado Vacío */}
          <div
            {...nativeDropProps}
            className={`
              relative border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out
              min-h-[200px] flex items-center justify-center
              ${
                isDragActive || isUploading
                  ? 'border-purple-500 bg-purple-500/10'
                  : isEmpty
                    ? 'border-[#2c1e4d] hover:border-[#3d2a5a]'
                    : 'border-[#2c1e4d] hover:border-[#3d2a5a]'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
          >
            <div className="text-center p-6">
              {/* Contenido principal - siempre visible */}
              <div
                className={`transition-opacity duration-300 ease-in-out ${isDragActive ? 'opacity-0' : 'opacity-100'}`}
              >
                {isEmpty ? (
                  <>
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-white font-medium text-lg mb-2">No hay mods instalados</p>
                    <p className="text-gray-400 text-sm mb-6">
                      Arrastra archivos aquí o usa los botones para gestionar tus mods
                    </p>
                  </>
                ) : (
                  <>
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm mb-3">
                      Arrastra más mods aquí para añadirlos
                    </p>
                  </>
                )}
              </div>

              {/* Mensaje de drag - solo visible durante drag */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${isDragActive ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-purple-400 font-medium text-lg">Suelta los archivos aquí</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Formatos soportados: .jar, .zip, .litemod
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones - siempre visibles */}
          {isEmpty ? (
            <div
              className={`flex justify-center gap-3 transition-opacity duration-300 ease-in-out ${isDragActive || isUploading ? 'opacity-50' : 'opacity-100'}`}
            >
              <Button
                variant="outline"
                onClick={handleOpenModsFolder}
                disabled={!currentServer || openFolder.isPending || isDragActive || isUploading}
                className="gap-2 border-[#2c1e4d] hover:bg-[#1d1332]"
              >
                <FolderOpen size={16} />
                Abrir Carpeta
              </Button>
              <Button
                variant="ghost"
                onClick={handleRefreshMods}
                disabled={modsQuery.isRefetching || isDragActive || isUploading}
                className="gap-2 hover:bg-[#1d1332]"
              >
                <RefreshCw size={16} className={modsQuery.isRefetching ? 'animate-spin' : ''} />
                Refrescar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">Mods Instalados</Label>
                <div className="flex  gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenModsFolder}
                    disabled={!currentServer || openFolder.isPending}
                    className="gap-2 border-[#2c1e4d] hover:bg-[#1d1332]"
                  >
                    <FolderOpen size={14} />
                    Abrir Carpeta
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshMods}
                    disabled={modsQuery.isRefetching}
                    className="gap-2 h-8 px-3 text-xs hover:bg-[#1d1332]"
                  >
                    <RefreshCw size={12} className={modsQuery.isRefetching ? 'animate-spin' : ''} />
                    Refrescar
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {dropinMods.map((mod) => (
                  <div
                    key={mod.fullName}
                    className="flex items-center justify-between p-3 bg-[#1d1332] border border-[#2c1e4d] rounded-lg hover:bg-[#251a3e] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium text-white truncate">{mod.name}</Label>
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          .{mod.ext}
                        </Badge>
                        {!mod.disabled && (
                          <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{mod.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Switch
                        checked={!mod.disabled}
                        onCheckedChange={(enabled) => handleToggleDropinMod(mod.fullName, enabled)}
                        disabled={toggleDropinMod.isPending}
                        className="data-[state=checked]:bg-purple-500"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDropinMod(mod.fullName)}
                        disabled={deleteDropinMod.isPending}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DndContext>
  )
}
