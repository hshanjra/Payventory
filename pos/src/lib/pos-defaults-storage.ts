import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

export const POS_DEFAULTS_STORE_KEY = 'posDefaults';

const posDefaultsStoredSchema = z.object({
  salesChannelId: z.string(),
  regionId: z.string(),
  stockLocationId: z.string(),
  departmentTagId: z.string().optional().nullable(),
});

export type PosDefaults = {
  salesChannelId: string;
  regionId: string;
  stockLocationId: string;
  departmentTagId?: string | null;
};

export function posDefaultsAreComplete(value: PosDefaults | null): boolean {
  if (!value) return false;
  return (
    !!value.salesChannelId?.trim() &&
    !!value.regionId?.trim() &&
    !!value.stockLocationId?.trim()
  );
}

export async function readPosDefaultsFromStore(): Promise<PosDefaults | null> {
  try {
    const raw = await SecureStore.getItemAsync(POS_DEFAULTS_STORE_KEY);
    if (!raw) return null;
    const parsedJson = JSON.parse(raw);
    const parsed = posDefaultsStoredSchema.safeParse(parsedJson);
    if (!parsed.success) return null;
    const v = parsed.data;
    const next: PosDefaults = {
      salesChannelId: v.salesChannelId.trim(),
      regionId: v.regionId.trim(),
      stockLocationId: v.stockLocationId.trim(),
      departmentTagId: v.departmentTagId?.trim() || undefined,
    };
    if (!posDefaultsAreComplete(next)) return null;
    return next;
  } catch {
    return null;
  }
}

export async function writePosDefaultsToStore(next: PosDefaults): Promise<void> {
  const normalized: PosDefaults = {
    salesChannelId: next.salesChannelId.trim(),
    regionId: next.regionId.trim(),
    stockLocationId: next.stockLocationId.trim(),
    departmentTagId: next.departmentTagId?.trim() || undefined,
  };
  if (!posDefaultsAreComplete(normalized)) {
    throw new Error('Invalid POS defaults');
  }
  const toStore: Record<string, string> = {
    salesChannelId: normalized.salesChannelId,
    regionId: normalized.regionId,
    stockLocationId: normalized.stockLocationId,
  };
  if (normalized.departmentTagId) {
    toStore.departmentTagId = normalized.departmentTagId;
  }
  await SecureStore.setItemAsync(POS_DEFAULTS_STORE_KEY, JSON.stringify(toStore));
}

export async function clearPosDefaultsFromStore(): Promise<void> {
  await SecureStore.deleteItemAsync(POS_DEFAULTS_STORE_KEY);
}
