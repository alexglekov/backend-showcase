import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { comparePasswords } from '@xyro/libs/utils';
import { RedisService } from '@xyro/libs/redis';
import { v4 as uuidV4 } from 'uuid';
import { LoggerService } from '@xyro/libs/logger';

import { Config } from '../../../infrastructure/config';
import { BackofficeUsersService } from '../../iam/users';

interface SignInParams {
  email: string;
  password: string;
  rememberSignIn: boolean;
}

interface TokenPayload {
  userId: string
  rememberSignIn: boolean;
}

interface SignOutParams {
  sessionId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly usersService: BackofficeUsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  public async signIn({ email, password, rememberSignIn }: SignInParams) {
    const foundUser = await this.usersService.findByEmail(email);

    if (!foundUser) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!comparePasswords(password, foundUser.passwordHash!)) {
      throw new BadRequestException('Invalid email or password');
    }

    const token = await this.generateToken({ userId: foundUser.id, rememberSignIn });
    const sessionId = uuidV4()
    const { sessionExpiresAt, refreshTokenExpiresAt } = this.configService.get('jwt');


    await this.redisService.set<TokenPayload>(
      sessionId,
      { userId: foundUser.id, rememberSignIn },
      { expiresInSeconds: sessionExpiresAt }
    );

    return {
      expires: {
        token: refreshTokenExpiresAt,
        sessionId: sessionExpiresAt,
      },
      token,
      sessionId,
      userId: foundUser.id,
    }
  }

  public async signOut(params: SignOutParams) {
    const { sessionId } = params;

    await this.redisService.delete(sessionId);

    return;
  }

  public async refreshSession(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken);
    const { sessionExpiresAt, refreshTokenExpiresAt } = this.configService.get('jwt');

    const token = await this.generateToken({
      userId: payload.userId,
      rememberSignIn: payload.rememberSignIn
    });
    const sessionId = uuidV4()

    await this.redisService.set<TokenPayload>(
      sessionId,
      {
        userId: payload.userId,
        rememberSignIn: payload.rememberSignIn
      },
      { expiresInSeconds: sessionExpiresAt }
    );

    return {
      expires: payload.rememberSignIn ? {
        token: refreshTokenExpiresAt,
        sessionId: sessionExpiresAt,
      } : undefined,
      token,
      sessionId,
      userId: payload.userId,
    }
  }

  public async getSession(sessionId: string) {
    return this.redisService.get<TokenPayload>(sessionId)
  }

  private async verifyToken(token: string): Promise<TokenPayload> {
    const { refreshTokenSecret } = this.configService.get('jwt');

    return await this.jwtService.verifyAsync<TokenPayload>(token, { secret: refreshTokenSecret });
  }

  private async generateToken(payload: TokenPayload) {
    const { refreshTokenSecret, refreshTokenExpiresAt } = this.configService.get('jwt');

    const token = await this.jwtService.signAsync(payload, { expiresIn: refreshTokenExpiresAt, secret: refreshTokenSecret });

    return token;
  }
}
