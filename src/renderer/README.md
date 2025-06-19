# Arquitectura Frontend - Perrito Studios Launcher

Esta documentación explica cómo usar la arquitectura de frontend basada en **Zustand** + **React Query** + **Hooks customizados**.

## 🏗️ Arquitectura

### Estado Global (Zustand)
- **Ubicación**: `src/stores/appStore.ts`
- **Uso**: Estado que necesita persistir y ser accesible globalmente
- **Incluye**: Auth, Config, UI state, Game state

### Data Fetching (React Query)
- **Ubicación**: `src/hooks/use*.ts`
- **Uso**: Datos que necesitan cache, refetch, sincronización
- **Incluye**: Servers, Mods, Distribution, etc.

### Hooks Customizados
- **Ubicación**: `src/hooks/`
- **Uso**: Encapsulan lógica de negocio y simplifican uso de APIs

## 🚀 Guía de Uso

### 1. Configuración Inicial

```tsx
// En tu App.tsx
import { AppProvider } from './providers/AppProvider'

function App() {
  return (
    <AppProvider>
      {/* Tu aplicación */}
    </AppProvider>
  )
}
```

### 2. Autenticación

```tsx
import { 
  useAuthStatus, 
  useAccounts, 
  useAddMojangAccount, 
  useSelectAccount 
} from '@/hooks'

function AuthComponent() {
  // Estado global
  const { user, isAuthenticated } = useAuth()
  
  // Data fetching con cache
  const { data: accounts, isLoading } = useAccounts()
  
  // Mutaciones
  const addAccount = useAddMojangAccount()
  const selectAccount = useSelectAccount()
  
  const handleAddAccount = () => {
    addAccount.mutate('username')
  }
  
  return (
    <div>
      <p>Usuario: {user?.displayName}</p>
      <button onClick={handleAddAccount}>
        {addAccount.isPending ? 'Añadiendo...' : 'Añadir Cuenta'}
      </button>
    </div>
  )
}
```

### 3. Configuración del Juego

```tsx
import { 
  useGameConfig, 
  useUpdateGameConfig, 
  useJavaConfig, 
  useUpdateJavaConfig 
} from '@/hooks'

function SettingsComponent() {
  const { data: gameConfig } = useGameConfig()
  const updateGameConfig = useUpdateGameConfig()
  const { data: javaConfig } = useJavaConfig('server-id')
  const updateJavaConfig = useUpdateJavaConfig('server-id')
  
  const handleUpdateSettings = () => {
    updateGameConfig.mutate({
      gameWidth: 1920,
      gameHeight: 1080,
      fullscreen: true
    })
  }
  
  return (
    <div>
      <p>Resolución: {gameConfig?.gameWidth}x{gameConfig?.gameHeight}</p>
      <button onClick={handleUpdateSettings}>
        Actualizar Configuración
      </button>
    </div>
  )
}
```

### 4. Lanzamiento del Juego

```tsx
import { useGameControl, useServerData } from '@/hooks'

function LaunchComponent() {
  const { 
    isRunning, 
    launch, 
    kill, 
    isLaunching,
    isKilling 
  } = useGameControl()
  
  const { activeServer, mainServer } = useServerData()
  
  const handleLaunch = () => {
    launch({
      serverId: activeServer?.id || '',
      authUser: user,
      distroServer: activeServer,
      vanillaManifest: {}, // Obtener de API
      modManifest: {} // Obtener de API
    })
  }
  
  return (
    <div>
      <p>Estado: {isRunning ? 'Corriendo' : 'Detenido'}</p>
      <button 
        onClick={isRunning ? kill : handleLaunch}
        disabled={isLaunching || isKilling}
      >
        {isRunning ? 'Detener' : 'Lanzar'} Juego
      </button>
    </div>
  )
}
```

### 5. Gestión de Servidores

```tsx
import { 
  useServerData, 
  useRefreshDistribution, 
  useSelectServer 
} from '@/hooks'

function ServerSelector() {
  const { 
    serverList, 
    activeServerId, 
    isLoading 
  } = useServerData()
  
  const refreshDistribution = useRefreshDistribution()
  const selectServer = useSelectServer()
  
  return (
    <div>
      <button onClick={() => refreshDistribution.mutate()}>
        {refreshDistribution.isPending ? 'Actualizando...' : 'Actualizar Servidores'}
      </button>
      
      {serverList.map(server => (
        <button
          key={server.id}
          onClick={() => selectServer.mutate(server.id)}
          className={activeServerId === server.id ? 'active' : ''}
        >
          {server.name} - {server.version}
        </button>
      ))}
    </div>
  )
}
```

### 6. Notificaciones

```tsx
import { useNotifications, useAppStore } from '@/hooks'

function NotificationComponent() {
  const notifications = useNotifications()
  const { removeNotification } = useAppStore()
  
  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  )
}
```

## 📁 Estructura de Archivos

```
src/renderer/src/
├── hooks/
│   ├── useAuth.ts          # Hooks de autenticación
│   ├── useConfig.ts        # Hooks de configuración
│   ├── useGameLauncher.ts  # Hooks del launcher
│   ├── useServers.ts       # Hooks de servidores
│   └── index.ts            # Export central
├── stores/
│   └── appStore.ts         # Store principal Zustand
├── providers/
│   └── AppProvider.tsx     # Provider de React Query
├── lib/
│   └── queryClient.ts      # Configuración React Query
└── components/
    └── examples/
        └── AuthExample.tsx # Ejemplos de uso
```

## 🔄 Flujo de Datos

1. **UI Component** llama a hook customizado
2. **Hook** usa React Query para data fetching
3. **Hook** actualiza Zustand store si es necesario
4. **Store** notifica a componentes suscritos
5. **UI** se actualiza automáticamente

## 💡 Tips y Buenas Prácticas

### ✅ Do's
- Usar hooks customizados para encapsular lógica
- Usar Zustand para estado global que necesita persistir
- Usar React Query para datos remotos con cache
- Manejar loading/error states en componentes
- Usar invalidation de queries después de mutaciones

### ❌ Don'ts
- No manejar estado remote en Zustand
- No hacer fetch manual cuando React Query puede hacerlo
- No duplicar estado entre Zustand y React Query
- No olvidar manejar casos de error

## 🐛 Debugging

### React Query DevTools
- Solo en desarrollo
- Acceso desde esquina inferior derecha
- Muestra estado de todas las queries/mutations

### Zustand DevTools
- Disponible en Redux DevTools
- Muestra historial de acciones
- Permite time-travel debugging

## 📋 APIs Disponibles

### window.api
- `auth`: Autenticación
- `config`: Configuración
- `distribution`: Servidores
- `process`: Control del juego
- `mods`: Gestión de mods
- `discord`: Discord RPC
- `language`: Sistema de idiomas
- `updater`: Auto-updater
- `microsoftAuth`: Auth ventanas
- `system`: Utilidades sistema

Todos estos están tipados y documentados en `src/preload/index.d.ts`. 