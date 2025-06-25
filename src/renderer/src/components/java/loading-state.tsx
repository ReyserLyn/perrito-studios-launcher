import { Code } from 'lucide-react'
import { ConfigTab, ConfigTabHeader } from '../config-manager/config-tab'

export const JavaLoadingState = () => (
  <ConfigTab value="java">
    <div className="flex flex-col gap-6">
      <ConfigTabHeader
        title="Java"
        description="Configura las opciones de Java para Minecraft"
        Icon={Code}
      />
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    </div>
  </ConfigTab>
)

export const JavaEmptyState = () => (
  <ConfigTab value="java">
    <div className="flex flex-col gap-6">
      <ConfigTabHeader
        title="Java"
        description="Configura las opciones de Java para Minecraft"
        Icon={Code}
      />
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay servidor seleccionado</p>
      </div>
    </div>
  </ConfigTab>
)
