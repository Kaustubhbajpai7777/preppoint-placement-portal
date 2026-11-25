import { Controller, Get } from '@nestjs/common'
import { SupabaseService } from './supabase.service'
@Controller('health')
export class HealthController {
  constructor(private readonly supabase: SupabaseService) {}
  @Get() health() { return { status: 'ok', service: 'placement-portal-api', supabaseConfigured: this.supabase.configured, timestamp: new Date().toISOString() } }
}
