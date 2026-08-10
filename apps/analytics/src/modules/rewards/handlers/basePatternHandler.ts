import { ChallengeTask, ChallengeTaskPattern, SeasonChallenge, UserChallengeTask } from '@prisma/client';
import { BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { User, UserCreatedDomainEventPayload, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';

export type ManualChallengeTaskArgs = {
  user: User;
};

export interface AutoChallengeTaskArgsVariations extends Record<ChallengeTaskPattern, unknown> {
  [ChallengeTaskPattern.ENRICH_PROFILE]: UserUpdatedDomainEventPayload;
  [ChallengeTaskPattern.COMMUNITY_CHALLENGE]: UserUpdatedDomainEventPayload;
  [ChallengeTaskPattern.DISCORD_CHALLENGE]: UserUpdatedDomainEventPayload;
  [ChallengeTaskPattern.INVITE_USERS]: UserCreatedDomainEventPayload;
  [ChallengeTaskPattern.PLAY_ANY_GAME]:
    UpDownGameChangedDomainEventPayload
    | SetupGameChangedDomainEventPayload
    | BullsEyeGameChangedDomainEventPayload
    | X1000GameChangedDomainEventPayload
    | OneVsOneGameChangedDomainEventPayload;
  [ChallengeTaskPattern.WON_GAMES]:
    UpDownGameChangedDomainEventPayload
    | SetupGameChangedDomainEventPayload
    | BullsEyeGameChangedDomainEventPayload
    | X1000GameChangedDomainEventPayload
    | OneVsOneGameChangedDomainEventPayload;
  [ChallengeTaskPattern.WHALE_SQUAD]:
    UpDownGameChangedDomainEventPayload
    | SetupGameChangedDomainEventPayload
    | BullsEyeGameChangedDomainEventPayload
    | X1000GameChangedDomainEventPayload
    | OneVsOneGameChangedDomainEventPayload;
}

type UserChallengeTaskWithTaskAndChallenge = UserChallengeTask & {
  task: ChallengeTask;
  challenge: SeasonChallenge;
};

export type UserChallengeTasksToBeClosed = UserChallengeTask[];

export enum HandlerMode {
  manual = 'manual',
  auto = 'auto',
}

export abstract class BasePatternHandler<Pattern extends ChallengeTaskPattern> {
  abstract handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed>;
  abstract handleAuto(payload: AutoChallengeTaskArgsVariations[Pattern]): Promise<UserChallengeTasksToBeClosed>;
  abstract supportModes(): HandlerMode[];
  abstract getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[];
}
