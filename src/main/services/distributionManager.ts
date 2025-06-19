import { DistributionAPI } from 'perrito-core/common'
import { getLauncherDirectory } from './configManager'

// URL del servidor de distribución remoto
export const REMOTE_DISTRO_URL = 'https://perrito.reyserlyn.com/servers/distribution.json'

// Crear la instancia de la API de distribución
const api = new DistributionAPI(getLauncherDirectory(), '', '', REMOTE_DISTRO_URL, false)

export { api as DistroAPI }
