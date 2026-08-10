/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "analytics";

export interface DashboardDataResult {
  data: DashboardData[];
}

export interface AddTelegramBotBonusByWalletAddressPayload {
  payload: string;
  signature: string;
}

export interface AddTelegramBotBonusByWalletAddressResult {
  isBonusAdded: boolean;
  isSignatureInvalid: boolean;
  isUserByAddressNotFound: boolean;
}

export interface Void {
}

export interface DashboardData {
  date: string;
  activeUsers: number;
  userBets: number;
  totalBets: number;
  income: number;
  from: string;
  to: string;
}

export interface AnalyticsService {
  getDashboardData(request: Void): Observable<DashboardDataResult>;
  addTelegramBotBonusByWalletAddress(
    request: AddTelegramBotBonusByWalletAddressPayload,
  ): Observable<AddTelegramBotBonusByWalletAddressResult>;
}
