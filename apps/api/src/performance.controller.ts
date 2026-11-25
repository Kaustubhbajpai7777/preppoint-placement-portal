import { Controller, Get, Req, UseGuards, ServiceUnavailableException } from '@nestjs/common'
import { Request } from 'express'
import { SupabaseService } from './supabase.service'
import { SupabaseAuthGuard } from './auth.guard'
@Controller('performance')
export class PerformanceController {
  constructor(private readonly supabase: SupabaseService) {}
  @Get()
  @UseGuards(SupabaseAuthGuard)
  async list(@Req() req: Request & { user?: any }) {
    if (!this.supabase.db) throw new ServiceUnavailableException('Supabase is not configured')
    const { data, error } = await this.supabase.db.from('performance_history')
      .select('id, assessment_name, score, total_marks, created_at')
      .eq('student_id', req.user.id).order('created_at', { ascending: false }).limit(100)
    if (error) throw new ServiceUnavailableException(error.message)
    return (data || []).map(row => ({ id: row.id, title: row.assessment_name, score: row.score, total: row.total_marks, date: row.created_at, label: 'Supabase' }))
  }
}
