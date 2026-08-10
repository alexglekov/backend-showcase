import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DomainEventsPublisher } from '@xyro/libs/events';
import {
  NotifyTaskCreatedDomainEvent,
  NotifyTaskType,
} from '@xyro/contracts/notifications';

import { UsersService } from '../../users';
import { SessionsService } from '../../sessions/sessions.service';
import { Config } from '../../../infrastructure/config';

interface SendRecoveryMessageParams {
  email: string;
}

interface RecoveryPasswordParams {
  newPassword: string;
  token: string;
}

interface RecoveryPasswordTokenPayload {
  userId: string;
}

const RECOVERY_PASSWORD_TOKEN_EXPIRES_IN = 60 * 60; // 1 hour

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly jwtService: JwtService,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
    protected readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<Config>,
  ) {}

  public async sendRecoveryMessage(params: SendRecoveryMessageParams) {
    const user = await this.usersService.findByEmail(params.email);

    if (!user) {
      throw new BadRequestException(`We didn't find user with this email.`);
    }

    const { recoveryPasswordTokenSecret } = this.configService.get('jwt');

    const tokenPayload: RecoveryPasswordTokenPayload = {
      userId: user.id,
    };

    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: recoveryPasswordTokenSecret,
      expiresIn: RECOVERY_PASSWORD_TOKEN_EXPIRES_IN,
    });

    await this.usersService.updateUser(user.id, {
      passwordRecoveryToken: token,
    })

    await this.domainEventsPublisher.publish(
      new NotifyTaskCreatedDomainEvent({
        type: NotifyTaskType.recoveryMessage,
        payload: {
          type: NotifyTaskType.recoveryMessage,
          email: user.email!,
          token: token,
        }
      })
    );
  }

  public async recoveryPassword(params: RecoveryPasswordParams) {
    try {
      const { recoveryPasswordTokenSecret } = this.configService.get('jwt');

      await this.jwtService.verifyAsync<RecoveryPasswordTokenPayload>(params.token, {
        secret: recoveryPasswordTokenSecret,
      })
    } catch (error) {
      throw new BadRequestException('Token is invalid');
    }

    const foundUser = await this.usersService.findByPasswordRecoveryToken(params.token)

    if (!foundUser) {
      throw new BadRequestException('Token is invalid');
    }

    await this.usersService.updateUser(
      foundUser.id,
      {
        password: params.newPassword,
        passwordRecoveryToken: null,
      }
    );

    await this.sessionsService.closeAllSessions({ userId: foundUser.id });
  }
}
