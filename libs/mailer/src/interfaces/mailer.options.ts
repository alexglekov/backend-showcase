import { InjectionToken } from '@nestjs/common';

export enum MailerProviders {
  awsSes = 'awsSes',
  nodemailer = 'nodemailer',
}

export interface SesMailerProviderOptions {
  type: MailerProviders.awsSes;
  sourceEmail: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface NodeMailerProviderOptions {
  type: MailerProviders.nodemailer;
  username: string;
  password: string;
}

export type MailerModuleOptions =
  | SesMailerProviderOptions
  | NodeMailerProviderOptions;

export interface MailerModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => MailerModuleOptions;
  inject?: InjectionToken[];
}
