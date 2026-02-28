import type { FormData } from '@/context/FormContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface ApplicationResponse {
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
  confirmations: string
  consent: string
  is_submitted: boolean
  is_approved: boolean
  is_evaluated: boolean
  risk_score: number | null
  created_at: string
  is_deleted: boolean
}

export interface ApiError {
  detail: string
}

export async function submitApplication(formData: FormData): Promise<ApplicationResponse> {
  const response = await fetch(`${API_BASE_URL}/applications/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error ${response.status}`)
  }

  return response.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    return response.ok
  } catch {
    return false
  }
}
