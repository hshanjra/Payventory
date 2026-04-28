import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createRemoteLinkStep,
  adjustInventoryLevelsStep,
} from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import {
  createStockTransferStep,
  CreateStockTransferInput,
} from "../steps/create-stock-transfer";
import { ensureInventoryLevelsStep } from "../steps/ensure-inventory-levels";
import { STOCK_TRANSFER_MODULE } from "@/modules/stock-transfer";

export const createStockTransferWorkflow = createWorkflow(
  "create-stock-transfer",
  function (input: CreateStockTransferInput) {
    const result = createStockTransferStep(input);

    ensureInventoryLevelsStep({
      items: input.items,
      location_ids: [input.from_location_id, input.to_location_id],
    });

    // Workflow composition restricts direct manipulation. transform() works safely execution block.
    const linkData = transform({ result }, (data) => {
      const links: any[] = [];
      const { transfer, rawItems } = data.result;

      for (let i = 0; i < transfer.items.length; i++) {
        const item = transfer.items[i];
        const rawItem = rawItems[i];

        links.push({
          [STOCK_TRANSFER_MODULE]: {
            stock_transfer_item_id: item.id,
          },
          [Modules.INVENTORY]: {
            inventory_item_id: rawItem.inventory_item_id,
          },
        });
      }
      return links;
    });

    createRemoteLinkStep(linkData);

    // Adjust inventory levels
    const inventoryAdjustments = transform({ input }, (data) => {
      const adjustments: any[] = [];

      for (const item of data.input.items) {
        // Subtract from source location
        adjustments.push({
          inventory_item_id: item.inventory_item_id,
          location_id: data.input.from_location_id,
          adjustment: -item.expected_quantity,
        });

        // Add to destination location
        adjustments.push({
          inventory_item_id: item.inventory_item_id,
          location_id: data.input.to_location_id,
          adjustment: item.expected_quantity,
        });
      }
      return adjustments;
    });

    adjustInventoryLevelsStep(inventoryAdjustments);

    const workflowReturn = transform(
      { result },
      (data) => data.result.transfer,
    );

    return new WorkflowResponse(workflowReturn);
  },
);
