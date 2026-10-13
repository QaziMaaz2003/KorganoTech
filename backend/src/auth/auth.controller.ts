import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import {
  JwtAuthGuard,
  readToken,
  SESSION_COOKIE,
} from '../common/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly jwtGuard: JwtAuthGuard,
  ) {}

  private cookieOptions(): CookieOptions {
    const days = Number(this.config.get('JWT_EXPIRES_IN_DAYS') ?? 7);
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: days * 24 * 60 * 60 * 1000,
    };
  }

  // 10 attempts per 10 minutes per IP. The key must match the 'default'
  // throttler configured in AppModule or the override is ignored.
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.auth.register(dto);
    res.cookie(SESSION_COOKIE, token, this.cookieOptions());
    return { user };
  }

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto);
    res.cookie(SESSION_COOKIE, token, this.cookieOptions());
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(user.id);
    const { maxAge: _maxAge, ...opts } = this.cookieOptions();
    res.clearCookie(SESSION_COOKIE, opts);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return { user: await this.auth.me(user.id) };
  }

  /** Like /me, but answers 200 with `user: null` for guests (no console noise). */
  @Get('session')
  async session(@Req() req: Request) {
    const token = readToken(req);
    const user = token ? await this.jwtGuard.userFromToken(token) : null;
    return { user: user ? await this.auth.me(user.id) : null };
  }
}
