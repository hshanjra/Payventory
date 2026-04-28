import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { STOCK_TRANSFER_MODULE } from "@/modules/stock-transfer";
import StockTransferModuleService from "@/modules/stock-transfer/service";

export const cancelStockTransferStep = createStep(
  "cancel-stock-transfer-step",
  async (id: string, { container }) => {
    const stockTransferService = container.resolve<StockTransferModuleService>(
      STOCK_TRANSFER_MODULE,
    );
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    // Fetch the transfer with items and their inventory links to know what to reverse
    const {
      data: [transfer],
    } = await query.graph({
      entity: "stock_transfer",
      fields: [
        "id",
        "from_location_id",
        "to_location_id",
        "status",
        "items.*",
        "items.inventory_item.id",
      ],
      filters: { id },
    });

    if (!transfer) {
      throw new Error(`Stock transfer with id ${id} not found`);
    }

    if (transfer.status === "cancelled") {
      return new StepResponse({ transfer, adjustments: [] }, null);
    }

    if (transfer.status === "completed") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Stock transfer with id ${id} is already completed`,
      );
    }

    // Update status to cancelled
    await stockTransferService.updateStockTransfers({
      id,
      status: "cancelled",
    });

    // Prepare inventory adjustments (reverse the initial movement)
    const adjustments: any[] = [];
    for (const item of transfer.items) {
      // The linked inventory item is usually in an array if queried through remote link
      const inventoryItemId =
        item?.inventory_item?.id || item?.inventory_item?.[0]?.id;

      if (!inventoryItemId) {
        console.warn(
          `No inventory item found for stock transfer item ${item?.id}`,
        );
        continue;
      }

      // Reverse: Add back to source
      adjustments.push({
        inventory_item_id: inventoryItemId,
        location_id: transfer.from_location_id,
        adjustment: item.expected_quantity,
      });

      // Reverse: Subtract from destination
      adjustments.push({
        inventory_item_id: inventoryItemId,
        location_id: transfer.to_location_id,
        adjustment: -item.expected_quantity,
      });
    }

    return new StepResponse({ transfer, adjustments }, id);
  },
  async (id, { container }) => {
    if (id) {
      const stockTransferService = container.resolve(STOCK_TRANSFER_MODULE);
      await stockTransferService.updateStockTransfers({
        id,
        status: "pending",
      });
    }
  },
);
