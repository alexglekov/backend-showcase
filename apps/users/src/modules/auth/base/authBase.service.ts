import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { comparePasswords, passwordToHash } from '@xyro/libs/utils';
import { Session } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { UserCreatedDomainEvent } from '@xyro/contracts/users';

import { UsersService } from '../../users';
import { AuthService } from '../auth.base-service';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralsService } from '../../referrals/referrals.service';
import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

interface SignInParams {
  email: string;
  password: string;
  agent: string;
  ip: string;
}

interface SignUpParams {
  name: string;
  email: string;
  password: string;
  agent: string;
  ip: string;
  referralCode: string;
}

@Injectable()
export class AuthBaseService extends AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    protected readonly sessionsService: SessionsService,
    protected readonly referralsService: ReferralsService,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    super(sessionsService);

    this.logger.setContext(AuthBaseService.name);
  }

  public async signIn({ email, password, agent, ip }: SignInParams): Promise<Session> {
    const foundUser = await this.usersService.findByEmail(email);

    if (!foundUser) {
      throw new BadRequestException('Invalid email or password.');
    }

    if (!comparePasswords(password, foundUser.passwordHash!)) {
      throw new BadRequestException('Invalid email or password.');
    }

    return this.afterLogin({
      agent,
      ip,
      userId: foundUser.id,
    });
  }

  public async signUp({
    name,
    email,
    password,
    agent,
    ip,
    referralCode,
  }: SignUpParams): Promise<Session> {
    try {
      const referral = await this.referralsService.checkReferralAvalability({
        code: referralCode,
      });

      const createdUser = await this.prismaService.$transaction(
        async (dbTransaction: DBTransaction) => {
          const user = await this.usersService.createUser(
            {
              name,
              email,
              passwordHash: passwordToHash(password),
            },
            dbTransaction
          );

          await this.referralsService.takeReferral(
            {
              userId: user.id,
              referrerId: referral.userId,
            },
            dbTransaction,
          );

          return user;
        },
      );

      await this.domainEventsPublisher.publish(new UserCreatedDomainEvent(createdUser, referral));

      return this.afterLogin({
        agent,
        ip,
        userId: createdUser.id,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(`Internal Server Error, please try again later...`);
    }
  }
}
