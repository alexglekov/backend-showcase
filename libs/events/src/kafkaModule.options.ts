import { InjectionToken } from '@nestjs/common';

export interface EventsModuleOptions {
  domainEventsClient?: {
    clientId: string;
    brokers: string[];
  };
  streamingEventsClient?: {
    host: string;
    port: number;
  }
}

export interface ConnectDomainEventsListenerOptions {
  clientId: string;
  groupId: string;
  brokers: string[];
}

export interface ConnectStreamingEventsListenerOptions {
  host: string;
  port: number;
}

export interface DomainEventsModuleAsyncOptions {
  /**
   * @default false
   */
  useStreamingEventsMode?: boolean;
  /**
   * @default false
   */
  useDomainEventsMode?: boolean;
  /**
   * @default []
   */
  imports?: any[];
  useFactory: (...args: any[]) => EventsModuleOptions;
  /**
   * @default undefinedn
   */
  inject?: InjectionToken[];
}

export const KAFKA_MODULE_CONFIG_TOKEN = 'KAFKA_MODULE_CONFIG_TOKEN';
