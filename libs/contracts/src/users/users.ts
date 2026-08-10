/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "users";

export interface Void {
}

export interface GetCountInvitedUsersByUserIdPayload {
  userId: string;
}

export interface GetCountUserDailyLoginsPayload {
  userId: string;
}

export interface GetCountUserDailyLoginsResult {
  userId: string;
  countDailyLogins: number;
}

export interface GetCountInvitedUsersByUserIdResult {
  countInvitedUsers: number;
}

export interface AcceptWithdrawOrderPaylaod {
  blameId: string;
  orderId: string;
}

export interface RejectWithdrawOrderPaylaod {
  blameId: string;
  orderId: string;
  cancelReason: string;
}

export interface RefreshSessionPayload {
  refreshToken: string;
}

export interface GetSessionByIdPayload {
  sessionId: string;
}

export interface GetUserByIdPayload {
  userId: string;
}

export interface GetByUserIdPayload {
  userId: string;
}

export interface GetUserByAddressPayload {
  address: string;
}

export interface User {
  id: string;
  name: string;
  avatarKeys: string[];
  avatarUris: string[];
  isInfluencer: boolean;
  email?: string | undefined;
  discordId?: string | undefined;
  twitterId?: string | undefined;
  walletAddress?: string | undefined;
  bio: string;
}

export interface Session {
  userId: string;
  refreshToken: string;
  sessionId: string;
  expiration?: SessionExpiration | undefined;
}

export interface SessionExpiration {
  session?: number | undefined;
  refreshToken?: number | undefined;
}

export interface CoinsPaidTransactionPayload {
  signature: string;
  body: string;
}

export interface ErrorPayload {
  type: string;
  message: string;
}

export interface UsersService {
  coinsPaidTransactionCallback(request: CoinsPaidTransactionPayload): Observable<Void>;
  acceptWithdrawOrder(request: AcceptWithdrawOrderPaylaod): Observable<Void>;
  rejectWithdrawOrder(request: RejectWithdrawOrderPaylaod): Observable<Void>;
  getSessionById(request: GetSessionByIdPayload): Observable<Session>;
  getUserById(request: GetUserByIdPayload): Observable<User>;
  getUserByAddress(request: GetUserByAddressPayload): Observable<User>;
  refreshSession(request: RefreshSessionPayload): Observable<Session>;
  getCountUserDailyLogins(request: GetCountUserDailyLoginsPayload): Observable<GetCountUserDailyLoginsResult>;
  getCountInvitedUsersByUserId(
    request: GetCountInvitedUsersByUserIdPayload,
  ): Observable<GetCountInvitedUsersByUserIdResult>;
}
