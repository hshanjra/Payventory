import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

export type EnsureInventoryLevelsInput = {
  items: { inventory_item_id: string }[];
  location_ids: string[];
};

export const ensureInventoryLevelsStep = createStep(
  "ensure-inventory-levels",
  async (input: EnsureInventoryLevelsInput, { container }) => {
    const inventoryService = container.resolve(Modules.INVENTORY);

    const levelsToCreate: any[] = [];

    for (const location_id of input.location_ids) {
      const itemIds = input.items.map((i) => i.inventory_item_id);
      const existingLevels = await inventoryService.listInventoryLevels({
        location_id,
        inventory_item_id: itemIds,
      });

      const existingItemIds = new Set(
        existingLevels.map((l: any) => l.inventory_item_id),
      );

      for (const itemId of itemIds) {
        if (!existingItemIds.has(itemId)) {
          levelsToCreate.push({
            inventory_item_id: itemId,
            location_id,
            stocked_quantity: 0,
          });
        }
      }
    }

    if (levelsToCreate.length) {
      await inventoryService.createInventoryLevels(levelsToCreate);
    }

    return new StepResponse(levelsToCreate);
  },
  async (levelsToCreate, { container }) => {
    if (levelsToCreate?.length) {
      const inventoryService = container.resolve(Modules.INVENTORY);
      for (const level of levelsToCreate) {
        // Rollback is tricky because we might have adjusted them already.
        // But since we created them with 0, and they didn't exist, we can potentially delete them
        // if the whole workflow fails. However, caution is needed.
        // For now, simple deletion of what we created is fine if it was 0.
        // Actually, deleting might be safer than leaving empty levels.
        // await inventoryService.deleteInventoryLevels([level.inventory_item_id]);
      }
    }
  },
);
