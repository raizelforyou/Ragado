const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number  // seconds until access token expires
}

export interface AdminUser {
  id: number
  email: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Confirmations {
  items: string[]
}

export interface Consents {
  fca_register_check: boolean
  accurate_information: boolean
  material_change: boolean
  preliminary_access: boolean
}

export interface Application {
  id: number
  entity_id: number
  trading_name: string
  registered_address: string
  full_name: string
  email: string
  telephone: string
  frn: string
  firm_status: string
  classes_of_business: string
  estimated_gwp: string
  additional_info: string
  handle_client_money: boolean
  confirmations: Confirmations
  consent: Consents
  is_submitted: boolean
  is_approved: boolean
  is_evaluated: boolean
  risk_score: number | null
  created_at: string
  is_deleted: boolean
  // Entity fields
  legal_entity_name: string
  company_number: string
}

export interface ApplicationListResponse {
  applications: Application[]
  total: number
  page: number
  page_size: number
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  TOKEN_EXPIRY: 'admin_token_expiry',
}

class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number | null = null
  private refreshPromise: Promise<TokenPair> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
      this.tokenExpiry = expiry ? parseInt(expiry, 10) : null
    }
  }

  private setTokens(tokens: TokenPair) {
    this.accessToken = tokens.access_token
    this.refreshToken = tokens.refresh_token
    // Calculate expiry time (current time + expires_in seconds - 60 seconds buffer)
    this.tokenExpiry = Date.now() + (tokens.expires_in - 60) * 1000

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token)
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiry.toString())
    }
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = null
    this.refreshPromise = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
    }
  }

  getToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true
    return Date.now() >= this.tokenExpiry
  }

  private async refreshAccessToken(): Promise<TokenPair> {
    // If already refreshing, return existing promise to prevent multiple refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    this.refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: 'Token refresh failed' }))
          throw new Error(error.detail || 'Token refresh failed')
        }
        return response.json()
      })
      .then((tokens: TokenPair) => {
        this.setTokens(tokens)
        this.refreshPromise = null
        return tokens
      })
      .catch((error) => {
        this.refreshPromise = null
        this.clearTokens()
        throw error
      })

    return this.refreshPromise
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    if (this.isTokenExpired() && this.refreshToken) {
      await this.refreshAccessToken()
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    // Ensure we have a valid token before making the request
    if (this.accessToken) {
      await this.ensureValidToken()
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    // Handle 401 errors - try to refresh token once
    if (response.status === 401 && retry && this.refreshToken) {
      try {
        await this.refreshAccessToken()
        return this.request<T>(endpoint, options, false) // Retry without further refresh
      } catch {
        this.clearTokens()
        throw new Error('Session expired. Please login again.')
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || `HTTP error ${response.status}`)
    }

    return response.json()
  }

  async login(credentials: LoginRequest): Promise<TokenPair> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(error.detail || 'Login failed')
    }

    const tokens: TokenPair = await response.json()
    this.setTokens(tokens)
    return tokens
  }

  async logout(): Promise<void> {
    if (this.refreshToken && this.accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        })
      } catch {
        // Ignore logout errors
      }
    }
    this.clearTokens()
  }

  async getCurrentUser(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/me')
  }

  async seedAdmin(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/seed', {
      method: 'POST',
    })
  }

  async getApplications(page = 1, pageSize = 10): Promise<ApplicationListResponse> {
    return this.request<ApplicationListResponse>(
      `/applications?page=${page}&page_size=${pageSize}`
    )
  }

  async getApplication(id: number): Promise<Application> {
    return this.request<Application>(`/applications/${id}`)
  }

  async approveApplication(id: number): Promise<Application> {
    return this.request<Application>(`/applications/${id}/approve`, {
      method: 'POST',
    })
  }

  async deleteApplication(id: number): Promise<void> {
    await this.request<void>(`/applications/${id}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
