import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionCreatedDomainEvent, SessionRefreshedDomainEvent } from '@xyro/contracts/users';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@xyro/libs/redis';
import DeviceDetector from 'node-device-detector';
import { Session } from '@prisma/client';
import { v4 as generateUUIDV4 } from 'uuid';

import { PrismaService } from '../../infrastructure/prisma';
import { Config } from '../../infrastructure/config';

type FastCreateSessionParams = {
  userId: string;
  agent: string;
  ip: string;
}

type CreateSessionParams = {
  id: string;
  refreshToken: string;
  userId: string;
  agent?: string;
  ip?: string;
}

type GetSessionByIdParams = {
  sessionId: Session['id']
}

type GetUserSessionsParams = {
  userId: string;
}

type CloseAllSessionsParams = {
  userId: string;
}

type GetCountUserDailyLoginsParams = {
  userId: string;
}

interface SignOutParams {
  userId: string;
  refreshToken: string;
  sessionId: string;
}

interface RefreshSessionParams {
  refreshToken: string;
}

const MAX_COUNT_SESSIONS_PER_ACCOUNT = 5;

@Injectable()
export class SessionsService {
  private readonly deviceDetector: DeviceDetector;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>,
    private readonly redisService: RedisService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    this.deviceDetector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    });
  }

  async getUserSessions(params: GetUserSessionsParams) {
    const { userId } = params;

    const sessions = await this.prismaService.session.findMany({
      where: {
        userId
      }
    })

    return sessions;
  }

  private checkAvailabilityCreateNewSession(sessions: Session[]): boolean {
    return sessions.length < MAX_COUNT_SESSIONS_PER_ACCOUNT;
  }

  private async removeLastSession(sessions: Session[]): Promise<void> {
    const sortedSessions = sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const [lastSession] = sortedSessions;

    await this.prismaService.session.delete({
      where: {
        id: lastSession.id,
      }
    });

    await this.redisService.delete(lastSession.id);
  }

  async сreate(params: FastCreateSessionParams) {
    const { agent, ip, userId } = params;

    const refreshToken = await this.generateToken({ userId });

    const detectionResult = agent ? this.deviceDetector.detect(agent) : null;
    const osName = detectionResult?.os.name || undefined;
    const clientName = detectionResult?.client.name || undefined;
    const clientType = detectionResult?.client.type || undefined;
    const deviceType = detectionResult?.device.type || undefined;
    const deviceBrand = detectionResult?.device.brand || undefined;
    const deviceModel = detectionResult?.device.model || undefined;

    const session = await this.prismaService.session.create({
      data: {
        userId,
        ip,
        agent,
        osName,
        clientName,
        clientType,
        deviceType,
        deviceBrand,
        deviceModel,
        refreshToken,
      },
    });

    await this.domainEventsPublisher.publish(new SessionCreatedDomainEvent(session));

    const { sessionExpiresAt } = this.configService.get('jwt');

    const payload = {
      sessionId: session.id,
      refreshToken,
      userId,
    }

    await this.redisService.set(session.id, payload, { expiresInSeconds: sessionExpiresAt });

    return session;
  }

  async removeLastSessions(params: CreateSessionParams) {
    const { userId } = params;

    const sessions = await this.getUserSessions({ userId });

    if (!this.checkAvailabilityCreateNewSession(sessions)) {
      await this.removeLastSession(sessions);
    }
  }

  async getCountUserDailyLogins(params: GetCountUserDailyLoginsParams) {
    const { userId } = params;

    return this.prismaService.userDailyLogin.count({ where: { userId } });
  }

  async getById({ sessionId }: GetSessionByIdParams): Promise<Pick<Session, 'userId' | 'refreshToken' | 'id'>> {
    const payload = await this.redisService.get<{
      sessionId: string;
      refreshToken: string;
      userId: string;
    }>(sessionId, true);

    if (payload) {
      return {
        userId: payload.userId,
        refreshToken: payload.refreshToken,
        id: payload.sessionId,
      }
    }

    throw new BadRequestException('Session not found')
  }

  public async refreshSession(params: RefreshSessionParams) {
    const { refreshToken } = params;

    try {
      const { refreshTokenSecret } = this.configService.get('jwt');
      await this.jwtService.verifyAsync(refreshToken, { secret: refreshTokenSecret });
    } catch {
      await this.prismaService.session.deleteMany({
        where: {
          refreshToken,
        }
      });
      throw new UnauthorizedException('User session not found');
    }

    // TODO: https://linear.app/xyro/issue/BE-364/users-auth-peresmotr-refresh-sessii
    // const token = await this.generateToken({ userId: session.userId });

    // const updatedSession = await this.prismaService.session.update({
    //   where: {
    //     id: session.id,
    //     userId: session.userId,
    //   },
    //   data: {
    //     refreshToken: token,
    //   },
    // });

    let session: Session;
    try {
      session = await this.prismaService.session.update({
        where: {
          refreshToken,
        },
        data: {
          updatedAt: new Date(),
        }
      });
    } catch (error) {
      throw new UnauthorizedException('User session not found');
    }

    const payload = {
      sessionId: session.id,
      refreshToken: session.refreshToken,
      userId: session.userId,
    };

    const { sessionExpiresAt } = this.configService.get('jwt');

    await this.redisService.set(session.id, payload, { expiresInSeconds: sessionExpiresAt });
    await this.domainEventsPublisher.publish(new SessionRefreshedDomainEvent(session));

    return session;
  }

  public async signOut(params: SignOutParams) {
    const { sessionId } = params;

    await this.redisService.delete(sessionId);

    await this.prismaService.session.delete({
      where: {
        id: sessionId,
      }
    });
  }

  public async closeAllSessions(params: CloseAllSessionsParams) {
    const { userId } = params;

    const sessions = await this.getUserSessions({ userId });

    await Promise.all([
      ...sessions.map((session) => this.redisService.delete(session.id)),
      this.prismaService.session.deleteMany({
        where: {
          id: {
            in: sessions.map((session) => session.id),
          }
        }
      })
    ])
  }


  private async generateToken(payload: { userId: string }) {
    const { refreshTokenExpiresAt, refreshTokenSecret } = this.configService.get('jwt');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTokenExpiresAt,
      secret: refreshTokenSecret,
      jwtid: generateUUIDV4(),
    });

    return token;
  }
}