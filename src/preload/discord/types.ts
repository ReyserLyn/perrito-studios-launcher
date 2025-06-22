export default interface DiscordAPI {
  init: (genSettings: any, servSettings: any, initialDetails?: string) => Promise<any>
  updateDetails: (details: string) => Promise<any>
  shutdown: () => Promise<any>
}
