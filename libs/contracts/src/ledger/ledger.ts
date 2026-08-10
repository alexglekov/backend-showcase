/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "ledger";

export interface GetUserBalancePayload {
  userId: string;
}

export interface Balance {
  id: string;
  accountId: string;
  amount: number;
}

export interface GetLedgerAccountByIdPayload {
  accountId: string;
}

export interface GetUserLedgerAccountPayload {
  userId: string;
}

export interface LedgerAccount {
  id: string;
  parentId?: string | undefined;
  name: string;
  fullName: string;
}

export interface LedgerService {
  getUserBalance(request: GetUserBalancePayload): Observable<Balance>;
  getLedgerAccountById(request: GetLedgerAccountByIdPayload): Observable<LedgerAccount>;
  getUserLedgerAccount(request: GetUserLedgerAccountPayload): Observable<LedgerAccount>;
}
