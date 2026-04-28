import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const CreateStockTransferSchema = z.object({
  reference: z.string().optional(),
  from_location_id: z.string(),
  to_location_id: z.string(),
  requested_by: z.string().optional(),
  items: z
    .array(
      z.object({
        inventory_item_id: z.string(),
        expected_quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreateStockTransferSchemaType = z.infer<
  typeof CreateStockTransferSchema
>;

export const UpdateStockTransferSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]),
  reference: z.string().optional(),
  items: z
    .array(
      z.object({
        item_id: z.string(),
        transferred_quantity: z.number().int().positive(),
      }),
    )
    .optional(),
});

export type UpdateStockTransferSchemaType = z.infer<
  typeof UpdateStockTransferSchema
>;

export const GetStockTransfersSchema = createFindParams();
