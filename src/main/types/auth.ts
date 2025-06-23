export interface AuthAccount {
  type?: 'mojang' | 'microsoft'
  accessToken: string
  username: string
  uuid: string
  displayName: string
  expiresAt?: Date
  microsoft?: {
    access_token: string
    refresh_token: string
    expires_at: Date
  }
}
