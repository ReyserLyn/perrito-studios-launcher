import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppInfo } from '@/hooks/config/about/use-app-info'
import { CheckCircle, ExternalLink, Github, Info, Loader2, Settings } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

export const AppInfoCard = () => {
  const { appInfo, isLoading, error, actions } = useAppInfo()
  const { version, isStable } = appInfo
  const { openGithub, openSupport, openDevTools } = actions

  return (
    <ConfigCard
      icon={Info}
      title="Perrito Studios Launcher"
      description="Launcher oficial para los servidores de Perrito Studios"
    >
      <div className="space-y-4">
        {/* Version Info */}
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/images/logos/Rec_Color_LBlanco.webp"
            alt="Perrito Studios Launcher"
            className="w-40 rounded-lg object-contain p-1"
          />
          <div>
            <div className="font-semibold text-lg flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cargando versión...
                </>
              ) : error ? (
                `v${version} (Error: ${error})`
              ) : (
                `v${version}`
              )}
            </div>
            {!isLoading && !error && (
              <Badge variant={isStable ? 'default' : 'secondary'} className="text-xs">
                <CheckCircle size={12} className="mr-1" />
                {isStable ? 'Versión Estable' : 'Pre-release'}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openGithub}
            className="flex items-center gap-2 text-sm"
          >
            <Github size={14} />
            Código Fuente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openSupport}
            className="flex items-center gap-2 text-sm"
          >
            <ExternalLink size={14} />
            Reportar Issues
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openDevTools}
            className="flex items-center gap-2 text-sm"
          >
            <Settings size={14} />
            Herramientas de Desarrollo
          </Button>
        </div>
      </div>
    </ConfigCard>
  )
}
