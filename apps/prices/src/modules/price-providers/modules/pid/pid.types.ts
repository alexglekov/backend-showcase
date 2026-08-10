import { AssetId } from '../../types';

export interface PidKoef {
  p: number;
  i: number;
  d: number;
}

export interface AssetKoef {
  ie: number;
  e: number;
  k: number;
}

export type KoefMap = Record<AssetId, number>;

export type PrevRowsMap = Record<AssetId, number[]>;

export type PidKoefMap = Record<AssetId, PidKoef>;
export type AssetKoefMap = Record<AssetId, AssetKoef>;
export type TargetDevMap = Record<AssetId, number | null>;
