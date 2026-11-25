import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common'
import { IsOptional, IsString, MaxLength } from 'class-validator'
class LaunchDto { @IsOptional() @IsString() @MaxLength(500) returnTo?: string }
@Controller('sso')
export class SsoController {
  @Post('launch')
  launch(@Body() _body: LaunchDto) {
    // This endpoint intentionally remains disabled until PrepPoint confirms a real
    // issuer/audience/signing and callback contract. Never send access tokens in URLs.
    if (!process.env.PREPPOINT_BASE_URL || !process.env.PREPPPOINT_SSO_AUDIENCE || !process.env.PREPPPOINT_SSO_SHARED_SECRET) {
      throw new HttpException({ statusCode: 501, message: 'SSO is not configured. Agree and implement a secure server-side handoff with the PrepPoint team first.' }, HttpStatus.NOT_IMPLEMENTED)
    }
    throw new HttpException({ statusCode: 501, message: 'SSO protocol adapter is not implemented. Configuration alone does not make the handoff secure.' }, HttpStatus.NOT_IMPLEMENTED)
  }
}
