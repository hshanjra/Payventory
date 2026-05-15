import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { SECURE_STORE_KEYS } from './secure-store-keys';

export const POS_DEFAULTS_STORE_KEY = SECURE_STORE_KEYS.POS_DEFAULTS;

const salesChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const baseCountrySchema = z.object({
  id: z.string().optional(),
  iso_2: z.string().optional(),
  iso_3: z.string().optional(),
  name: z.string().optional(),
});

const regionSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency_code: z.string(),
  automatic_taxes: z.boolean().optional(),
  countries: z.array(baseCountrySchema.nullable()),
});

const addressSchema = z.object({
  id: z.string(),
  address_1: z.string(),
  address_2: z.string().nullable(),
  company: z.string().nullable(),
  country_code: z.string().nullable(),
  city: z.string().nullable(),
  phone: z.string().nullable(),
  postal_code: z.string().nullable(),
  province: z.string().nullable(),
});

const stockLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: addressSchema.optional(),
});

const departmentTagSchema = z.object({
  id: z.string(),
  value: z.string(),
});

const posDefaultsStoredSchema = z.object({
  salesChannel: salesChannelSchema,
  region: regionSchema,
  stockLocation: stockLocationSchema,
  departmentTag: departmentTagSchema.nullable().optional(),
});

export type PosDefaults = z.infer<typeof posDefaultsStoredSchema>;

export function posDefaultsAreComplete(value: PosDefaults | null): boolean {
  if (!value) return false;
  return (
    !!value.salesChannel.id.trim() && !!value.region.id.trim() && !!value.stockLocation.id.trim()
  );
}

export async function readPosDefaultsFromStore(): Promise<PosDefaults | null> {
  try {
    const raw = await SecureStore.getItemAsync(POS_DEFAULTS_STORE_KEY);
    if (!raw) return null;
    const parsedJson = JSON.parse(raw);

    if (!posDefaultsAreComplete(parsedJson)) return null;
    return parsedJson;
  } catch {
    return null;
  }
}

export async function writePosDefaultsToStore(next: PosDefaults): Promise<void> {
  if (!posDefaultsAreComplete(next)) {
    throw new Error('Invalid POS defaults');
  }

  const parsed = posDefaultsStoredSchema.safeParse(next);
  if (!parsed.success) {
    console.log(parsed.error);
    throw new Error('Invalid POS defaults');
  }
  await SecureStore.setItemAsync(POS_DEFAULTS_STORE_KEY, JSON.stringify(next));
}

export async function clearPosDefaultsFromStore(): Promise<void> {
  await SecureStore.deleteItemAsync(POS_DEFAULTS_STORE_KEY);
}
