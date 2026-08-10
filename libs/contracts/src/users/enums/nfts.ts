import { BadRequestException } from '@nestjs/common';

export type NftTokenIds = 0 | 1 | 2 | 3;
export type NftLabels = 'common' | 'rare' | 'epic' | 'legendary';

const NftLabelToTokenIdMap = new Map<NftLabels, NftTokenIds>();
const NftTokenIdToLabelMap = new Map<NftTokenIds, NftLabels>();
const NftTokenIdToValueMap = new Map<NftTokenIds, number>();

NftLabelToTokenIdMap.set('common', 0);
NftLabelToTokenIdMap.set('rare', 1);
NftLabelToTokenIdMap.set('epic', 2);
NftLabelToTokenIdMap.set('legendary', 3);

NftTokenIdToLabelMap.set(0, 'common');
NftTokenIdToLabelMap.set(1, 'rare');
NftTokenIdToLabelMap.set(2, 'epic');
NftTokenIdToLabelMap.set(3, 'legendary');

NftTokenIdToValueMap.set(0, 250);
NftTokenIdToValueMap.set(1, 500);
NftTokenIdToValueMap.set(2, 1000);
NftTokenIdToValueMap.set(3, 2000);

export function getAllNftLabels() {
  return Array.from(NftLabelToTokenIdMap.keys());
}

export function getAllNftTokenIds() {
  return Array.from(NftTokenIdToLabelMap.keys());
}

export function getNftTokenIdByLabel(label: string): NftTokenIds {
  const token = NftLabelToTokenIdMap.get(label as any);
  if (typeof token !== 'number') throw new BadRequestException(`Unknown label: ${label}`);
  return token;
}

export function getNftLabelByTokenId(tokenId: number): NftLabels {
  const token = NftTokenIdToLabelMap.get(tokenId as any);
  if (!token) throw new BadRequestException(`Unknown token id: ${tokenId}`);
  return token;
}

export function getNftValueByTokenId(tokenId: number): number {
  const value = NftTokenIdToValueMap.get(tokenId as any);
  if (!value) throw new BadRequestException(`Unknown token id: ${tokenId}`);
  return value;
}

export function getNftValueByLabel(label: string): number {
  const value = NftTokenIdToValueMap.get(getNftTokenIdByLabel(label));
  if (!value) throw new BadRequestException(`Unknown label: ${label}`);
  return value;
}
