import { AuthAccount } from '../../main/types/auth'

type AddMojangAccountResponse =
  | { success: true; account: AuthAccount }
  | { success: false; error: string }

type RemoveMojangAccountResponse = { success: true } | { success: false; error: string }

type AddMicrosoftAccountResponse =
  | { success: true; account: AuthAccount }
  | { success: false; error: string }

type RemoveMicrosoftAccountResponse = { success: true } | { success: false; error: string }

type GetSelectedAccountResponse =
  | { success: true; account: AuthAccount }
  | { success: false; error: string }

type GetAllAccountsResponse =
  | { success: true; accounts: Record<string, AuthAccount> }
  | { success: false; error: string }

type SelectAccountResponse =
  | { success: true; account: AuthAccount }
  | { success: false; error: string }

type ValidateSelectedResponse =
  | { success: true; isValid: boolean }
  | { success: false; error: string }

type LogoutResponse = { success: true } | { success: false; error: string }

export default interface AuthAPI {
  // Mojang accounts
  addMojangAccount: (username: string) => Promise<AddMojangAccountResponse>
  removeMojangAccount: (uuid: string) => Promise<RemoveMojangAccountResponse>

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) => Promise<AddMicrosoftAccountResponse>
  removeMicrosoftAccount: (uuid: string) => Promise<RemoveMicrosoftAccountResponse>

  // Account management
  getSelectedAccount: () => Promise<GetSelectedAccountResponse>
  getAllAccounts: () => Promise<GetAllAccountsResponse>
  selectAccount: (uuid: string) => Promise<SelectAccountResponse>
  validateSelected: () => Promise<ValidateSelectedResponse>
  logout: () => Promise<LogoutResponse>
}
