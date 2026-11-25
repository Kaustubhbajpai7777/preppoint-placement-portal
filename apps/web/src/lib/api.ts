import { supabase } from './supabase'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
  const token = data.session?.access_token
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const dataBody = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(dataBody.message || `Request failed (${response.status})`)
  return dataBody as T
}
