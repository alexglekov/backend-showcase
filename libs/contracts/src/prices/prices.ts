/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "prices";

export interface AssetIdPayload {
  assetId: string;
}

export interface AssetAtTimePayload {
  assetId: string;
  timestamp: number;
}

export interface AssetPricePayload {
  price: number;
  timestamp: number;
}

export interface PricesService {
  getAssetCurrentPrice(request: AssetIdPayload): Observable<AssetPricePayload>;
  getAssetPriceAtTime(request: AssetAtTimePayload): Observable<AssetPricePayload>;
}
