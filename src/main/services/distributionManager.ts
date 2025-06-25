import { DistributionAPI } from 'perrito-core/common'
import { getLauncherDirectory } from './configManager'

// URL del servidor de distribución remoto
//export const REMOTE_DISTRO_URL = 'https://perrito.reyserlyn.com/servers/distribution.json'
export const REMOTE_DISTRO_URL = 'https://helios-files.geekcorner.eu.org/distribution.json'

// Crear la instancia de la API de distribución
const distroAPI = new DistributionAPI(getLauncherDirectory(), '', '', REMOTE_DISTRO_URL, false)

export { distroAPI }
