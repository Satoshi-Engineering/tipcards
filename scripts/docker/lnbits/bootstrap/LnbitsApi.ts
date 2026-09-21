import type { ExtensionContract } from './config.js'

const READINESS_TIMEOUT_MS = 60_000
const READINESS_INTERVAL_MS = 1_000

interface AuthResponse {
  access_token: string
}

export interface AuthenticatedUser {
  id: string
}

export interface Wallet {
  id: string
  user: string
  name: string
  adminkey: string
  inkey: string
  currency?: string | null
  balance_msat: number
}

interface User extends AuthenticatedUser {
  wallets: Wallet[]
}

interface UserPage {
  data: Array<{ id: string }>
  total: number
}

export interface ExtensionInfo {
  id: string
  isInstalled: boolean
  isActive: boolean
  installedRelease?: {
    version?: string
  }
}

interface InvoiceWallet {
  name: string
  balance: number
}

interface AdminSettings {
  lnbits_callback_allow_private_ips: boolean
  lnbits_lnurl_allow_private_ips: boolean
}

interface ApiRequestOptions {
  method?: string
  token?: string
  apiKey?: string
  body?: unknown
}

interface ApiErrorBody {
  detail?: string
  message?: string
}

export class LnbitsApi {
  constructor(private readonly baseUrl: string) {}

  async waitUntilReady(): Promise<void> {
    const deadline = Date.now() + READINESS_TIMEOUT_MS
    let lastError: unknown

    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/health`)
        if (response.ok) {
          return
        }
        lastError = new Error(`HTTP ${response.status}`)
      } catch (error) {
        lastError = error
      }
      await new Promise(resolve => setTimeout(resolve, READINESS_INTERVAL_MS))
    }

    throw new Error(`LNbits did not become ready within ${READINESS_TIMEOUT_MS / 1_000} seconds.`, { cause: lastError })
  }

  async authenticate(username: string, password: string): Promise<string> {
    const loginResponse = await this.rawRequest('/api/v1/auth', {
      method: 'POST',
      body: { username, password },
    })
    if (loginResponse.ok) {
      console.error('Authenticated the LNbits bootstrap identity.')
      return extractAccessToken(await loginResponse.json())
    }
    if (![401, 405].includes(loginResponse.status)) {
      throw await apiError('/api/v1/auth', loginResponse)
    }

    console.error('Completing LNbits first installation.')
    const firstInstallResponse = await this.rawRequest('/api/v1/auth/first_install', {
      method: 'PUT',
      body: { username, password, password_repeat: password },
    })
    if (!firstInstallResponse.ok) {
      throw await apiError('/api/v1/auth/first_install', firstInstallResponse)
    }
    return extractAccessToken(await firstInstallResponse.json())
  }

  getAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
    return this.request('/api/v1/auth', { token })
  }

  async allowPrivateNetworkTargets(token: string): Promise<void> {
    const settings = await this.request<AdminSettings>('/admin/api/v1/settings', { token })
    if (settings.lnbits_callback_allow_private_ips && settings.lnbits_lnurl_allow_private_ips) {
      return
    }

    console.error('Allowing LNURL requests and callbacks to the local Docker network.')
    await this.request('/admin/api/v1/settings', {
      method: 'PATCH',
      token,
      body: {
        lnbits_callback_allow_private_ips: true,
        lnbits_lnurl_allow_private_ips: true,
      },
    })
  }

  async getWallets(token: string): Promise<Wallet[]> {
    const users: User[] = []
    let offset = 0
    const limit = 100

    while (true) {
      const page = await this.request<UserPage>(`/users/api/v1/user?limit=${limit}&offset=${offset}`, { token })
      for (const account of page.data) {
        users.push(await this.request<User>(`/users/api/v1/user/${account.id}`, { token }))
      }
      offset += page.data.length
      if (offset >= page.total || page.data.length === 0) {
        return users.flatMap(user => user.wallets)
      }
    }
  }

  getWallet(apiKey: string): Promise<Wallet> {
    return this.request('/api/v1/wallet', { apiKey })
  }

  getInvoiceWallet(apiKey: string): Promise<InvoiceWallet> {
    return this.request('/api/v1/wallet', { apiKey })
  }

  createWallet(token: string, name: string): Promise<Wallet> {
    return this.request('/api/v1/wallet', { method: 'POST', token, body: { name } })
  }

  async renameWallet(apiKey: string, name: string): Promise<void> {
    await this.request(`/api/v1/wallet/${encodeURIComponent(name)}`, { method: 'PUT', apiKey })
  }

  async updateBalance(token: string, id: string, amount: number): Promise<void> {
    await this.request('/users/api/v1/balance', { method: 'PUT', token, body: { id, amount } })
  }

  getExtensions(token: string): Promise<ExtensionInfo[]> {
    return this.request('/api/v1/extension/all', { token })
  }

  async installExtension(token: string, extension: ExtensionContract): Promise<void> {
    await this.request('/api/v1/extension', {
      method: 'POST',
      token,
      body: {
        ext_id: extension.id,
        archive: extension.archive,
        source_repo: extension.sourceRepo,
        version: extension.version,
      },
    })
  }

  async activateExtension(token: string, id: string): Promise<void> {
    await this.request(`/api/v1/extension/${id}/activate`, { method: 'PUT', token })
  }

  async enableExtension(token: string, id: string): Promise<void> {
    await this.request(`/api/v1/extension/${id}/enable`, { method: 'PUT', token })
  }

  async authenticateUserId(userId: string): Promise<string> {
    const response = await this.request<AuthResponse>('/api/v1/auth/usr', {
      method: 'POST',
      body: { usr: userId },
    })
    return extractAccessToken(response)
  }

  private async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await this.rawRequest(path, options)
    if (!response.ok) {
      throw await apiError(path, response)
    }
    return response.json() as Promise<T>
  }

  private rawRequest(path: string, options: ApiRequestOptions): Promise<Response> {
    const headers = new Headers({ accept: 'application/json' })
    if (options.token) {
      headers.set('authorization', `Bearer ${options.token}`)
    }
    if (options.apiKey) {
      headers.set('x-api-key', options.apiKey)
    }
    if (options.body !== undefined) {
      headers.set('content-type', 'application/json')
    }
    return fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  }
}

function extractAccessToken(response: unknown): string {
  if (!response || typeof response !== 'object' || !('access_token' in response) || typeof response.access_token !== 'string') {
    throw new Error('LNbits authentication response did not contain an access token.')
  }
  return response.access_token
}

async function apiError(path: string, response: Response): Promise<Error> {
  let message = ''
  try {
    const body = await response.json() as ApiErrorBody
    message = body.detail ?? body.message ?? ''
  } catch {
    // The status and endpoint still provide an actionable error without leaking response bodies.
  }
  const suffix = message ? `: ${message}` : ''
  return new Error(`LNbits ${path} failed with HTTP ${response.status}${suffix}`)
}
