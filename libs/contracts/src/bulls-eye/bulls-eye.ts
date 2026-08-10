/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "bullsEye";

export interface Void {
}

export interface GetBetByPaylaod {
  gameId?: string | undefined;
  ownerId?: string | undefined;
}

export interface BullsEyeBet {
  isExact: boolean;
  id: string;
  gameId: string;
  ownerId: string;
  type: string;
  amount: number;
  result: string;
  createdAt: string;
  place?: number | undefined;
  fee?: number | undefined;
  pnl?: number | undefined;
  outcome?: number | undefined;
  price?: number | undefined;
  isUp?: boolean | undefined;
  priceResult?: number | undefined;
  isUpResult?: boolean | undefined;
}

export interface BullsEyeService {
  getBetBy(request: GetBetByPaylaod): Observable<BullsEyeBet>;
}
