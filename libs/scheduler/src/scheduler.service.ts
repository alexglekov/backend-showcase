import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';
import { DateTime } from 'luxon';

type ScheduleJobParams = {
  jobName: string;
  date: Date;
  callback: (...args: any[]) => Promise<unknown>;
};

type ScheduleRepeatJobParams = {
  jobName: string;
  milliseconds: number;
  callback: (...args: any[]) => Promise<unknown>;
};

@Injectable()
export class SchedulerService {
  constructor(
    private readonly scheduleRegistry: SchedulerRegistry,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(SchedulerService.name);
  }

  public scheduleJob(params: ScheduleJobParams, ...args: unknown[]) {
    const date = this.getDatetimeFromAny(params.date);

    const { milliseconds } = date.diffNow().toObject();

    if (this.scheduleRegistry.doesExist('timeout', params.jobName)) {
      this.scheduleRegistry.deleteTimeout(params.jobName);
    }

    const timeoutId = setTimeout(
      () =>
        params
          .callback(...args)
          .catch((error) => this.logger.error(error, error.stack)),
      milliseconds! <= 0 ? 0 : milliseconds
    );

    if (milliseconds! >= 0) {
      this.scheduleRegistry.addTimeout(params.jobName, timeoutId);
    }
  }

  public deleteJob(jobName: string) {
    if (this.scheduleRegistry.doesExist('timeout', jobName)) {
      const timeoutId = this.scheduleRegistry.getTimeout(jobName);

      clearTimeout(timeoutId);

      this.scheduleRegistry.deleteTimeout(jobName);
    }
  }

  public scheduleRepeatJob(
    params: ScheduleRepeatJobParams,
    ...args: unknown[]
  ) {
    if (params.milliseconds <= 0) {
      throw new InternalServerErrorException(
        'UnexpectedError: interval must be more then 0 millisecond'
      );
    }

    const intervalId = setInterval(() => {
      return params
        .callback(...args)
        .catch((error) => this.logger.error(error, error.stack));
    }, params.milliseconds);

    this.scheduleRegistry.addInterval(params.jobName, intervalId);
  }

  public deleteRepeatJob(jobName: string) {
    if (this.scheduleRegistry.doesExist('interval', jobName)) {
      const intervalId = this.scheduleRegistry.getInterval(jobName);

      clearInterval(intervalId);

      this.scheduleRegistry.deleteInterval(jobName);
    }
  }

  private getDatetimeFromAny(date: Date | string) {
    if (typeof date === 'string') {
      return DateTime.fromISO(date, { zone: 'UTC' });
    }

    return DateTime.fromJSDate(date);
  }
}
