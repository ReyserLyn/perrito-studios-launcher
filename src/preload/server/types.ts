type GetStatusResponse = {
  success: boolean
  status: {
    status: 'online' | 'offline'
    players: {
      online: number
      max: number
      label: string
    }
    version: string
    motd: string
  }
}

export default interface ServerAPI {
  getStatus: (hostname: string, port: number) => Promise<GetStatusResponse>
}
