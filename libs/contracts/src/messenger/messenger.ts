/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "messenger";

export interface GetUserMessagesAmountPayload {
  userId: string;
}

export interface GetUserMessagesAmountResult {
  amount: number;
}

export interface Void {
}

export interface MessengerService {
  getUserMessagesAmount(request: GetUserMessagesAmountPayload): Observable<GetUserMessagesAmountResult>;
}
