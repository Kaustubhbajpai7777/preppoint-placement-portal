import { Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null
  constructor() {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) this.client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  get configured() { return !!this.client }
  async verifyUser(token: string) {
    if (!this.client) throw new Error('Supabase backend is not configured')
    const { data, error } = await this.client.auth.getUser(token)
    if (error || !data.user) throw new Error('Invalid or expired session')
    return data.user
  }
  get db() { return this.client }
}
