import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { PerformanceController } from './performance.controller'
import { SsoController } from './sso.controller'
import { ResumeController } from './resume.controller'
import { SupabaseService } from './supabase.service'
@Module({ controllers: [HealthController, PerformanceController, SsoController, ResumeController], providers: [SupabaseService] })
export class AppModule {}
