import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { STOCK_TRANSFER_MODULE } from "@/modules/stock-transfer";
import StockTransferModuleService from "@/modules/stock-transfer/service";

export type CreateStockTransferInput = {
  reference?: string;
  from_location_id: string;
  to_location_id: string;
  requested_by?: string;
  items: {
    inventory_item_id: string;
    expected_quantity: number;
  }[];
};

export const createStockTransferStep = createStep(
  "create-stock-transfer-step",
  async (input: CreateStockTransferInput, { container }) => {
    const stockTransferService = container.resolve<StockTransferModuleService>(
      STOCK_TRANSFER_MODULE,
    );

    const [transfer] = await stockTransferService.createStockTransfers([
      {
        reference: input.reference,
        from_location_id: input.from_location_id,
        to_location_id: input.to_location_id,
        requested_by: input.requested_by,
        status: "pending",
      },
    ]);

    await stockTransferService.createStockTransferItems(
      input.items.map((i) => ({
        stock_transfer_id: transfer.id,
        expected_quantity: i.expected_quantity,
        transferred_quantity: 0,
      })),
    );

    const fullTransfer = await stockTransferService.retrieveStockTransfer(
      transfer.id,
      {
        relations: ["items"],
      },
    );

    return new StepResponse(
      { transfer: fullTransfer, rawItems: input.items },
      transfer.id,
    );
  },
  async (id, { container }) => {
    if (id) {
      const stockTransferService = container.resolve(STOCK_TRANSFER_MODULE);
      await stockTransferService.deleteStockTransfers(id);
    }
  },
);
