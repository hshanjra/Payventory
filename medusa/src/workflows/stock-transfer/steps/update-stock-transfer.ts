import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { STOCK_TRANSFER_MODULE } from "@/modules/stock-transfer";
import StockTransferModuleService from "@/modules/stock-transfer/service";
import { MedusaError } from "@medusajs/framework/utils";

export type UpdateStockTransferInput = {
  id: string;
  reference?: string;
  status?: "pending" | "completed" | "cancelled";
  items?: {
    item_id: string;
    transferred_quantity?: number;
  }[];
};

export const updateStockTransferStep = createStep(
  "update-stock-transfer",
  async (input: UpdateStockTransferInput, { container }) => {
    const stockTransferService = container.resolve<StockTransferModuleService>(
      STOCK_TRANSFER_MODULE,
    );
    const transferBeforeUpdate =
      await stockTransferService.retrieveStockTransfer(input.id, {
        relations: ["items"],
      });

    if (
      transferBeforeUpdate.status === "completed" ||
      transferBeforeUpdate.status === "cancelled"
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot update stock transfer with id ${input.id} as it is already completed or cancelled`,
      );
    }

    const updateData: any = { ...input };
    delete updateData.id;
    delete updateData.items;

    const [updatedTransfer] = await stockTransferService.updateStockTransfers([
      {
        id: input.id,
        ...updateData,
      },
    ]);

    if (input.items && input.items.length > 0) {
      await stockTransferService.updateStockTransferItems(
        input.items.map((i) => ({
          id: i.item_id,
          transferred_quantity: i.transferred_quantity,
        })),
      );
    }

    return new StepResponse(updatedTransfer, transferBeforeUpdate);
  },
  async (transferBeforeUpdate, { container }) => {
    if (transferBeforeUpdate) {
      const stockTransferService = container.resolve(STOCK_TRANSFER_MODULE);
      await stockTransferService.updateStockTransfers([
        {
          id: transferBeforeUpdate.id,
          reference: transferBeforeUpdate.reference,
          status: transferBeforeUpdate.status,
          from_location_id: transferBeforeUpdate.from_location_id,
          to_location_id: transferBeforeUpdate.to_location_id,
          requested_by: transferBeforeUpdate.requested_by,
        },
      ]);

      if (transferBeforeUpdate.items && transferBeforeUpdate.items.length > 0) {
        await stockTransferService.updateStockTransferItems(
          transferBeforeUpdate.items.map((i) => ({
            id: i.id,
            transferred_quantity: i.transferred_quantity,
          })),
        );
      }
    }
  },
);
