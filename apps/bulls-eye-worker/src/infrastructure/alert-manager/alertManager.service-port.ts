export enum RiskLevel {
  high = 'high',
  medium = 'medium',
  low = 'low'
}

export interface NotifyParams {
  title: string;
  level: RiskLevel;
  description: string;
}

export abstract class AlertManager {
  abstract notify(params: NotifyParams): Promise<void>;
}