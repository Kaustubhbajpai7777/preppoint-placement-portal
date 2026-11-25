import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { SupabaseService } from './supabase.service'
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw new UnauthorizedException('Bearer token required')
    try { req.user = await this.supabase.verifyUser(token); return true }
    catch { throw new UnauthorizedException('Invalid or expired session') }
  }
}
