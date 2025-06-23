import { HeliosServer } from 'perrito-core/common'
import { ModManifest, VanillaManifest } from '../../main/types/processBuilder'
import { AuthAccount } from '../../main/types/auth'

type ValidateLaunchResponse =
  | { success: true; server: HeliosServer; authUser: AuthAccount }
  | { success: false; error: string }

type SystemScanResponse =
  | { success: true; needsDownload: false; javaPath: string }
  | { success: true; needsDownload: true; suggestedMajor: number }
  | { success: false; error: string }

type DownloadJavaResponse = { success: true; javaPath: string } | { success: false; error: string }

type ValidateAndDownloadResponse =
  | { success: true; invalidFileCount: number; downloadPerformed: boolean }
  | { success: false; error: string }

type PrepareLaunchResponse =
  | {
      success: true
      server: HeliosServer
      authUser: AuthAccount
      modLoaderData: ModManifest
      versionData: VanillaManifest
    }
  | { success: false; error: string }

type LaunchGameResponse = { success: true; pid: number } | { success: false; error: string }

export type LaunchGameOptions = {
  server: HeliosServer
  authUser: AuthAccount
  modLoaderData: ModManifest
  versionData: VanillaManifest
}

export default interface ProcessAPI {
  killProcess: () => Promise<{
    success: boolean
    error?: string
  }>
  getProcessStatus: () => Promise<{
    success: boolean
    status: string
    error?: string
  }>

  validateLaunch: () => Promise<ValidateLaunchResponse>

  systemScan: (serverId: string) => Promise<SystemScanResponse>

  downloadJava: (serverId: string) => Promise<DownloadJavaResponse>

  validateAndDownload: (serverId: string) => Promise<ValidateAndDownloadResponse>

  prepareLaunch: (serverId: string) => Promise<PrepareLaunchResponse>

  launchGame: (options: LaunchGameOptions) => Promise<LaunchGameResponse>
}
