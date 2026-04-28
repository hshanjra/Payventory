import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { STOCK_TRANSFER_MODULE } from "@/modules/stock-transfer";
import StockTransferModuleService from "@/modules/stock-transfer/service";
import { MedusaError } from "@medusajs/framework/utils";

export const deleteStockTransferStep = createStep(
  "delete-stock-transfer",
  async (id: string, { container }) => {
    const stockTransferService = container.resolve<StockTransferModuleService>(
      STOCK_TRANSFER_MODULE,
    );

    const transfer = await stockTransferService.retrieveStockTransfer(id);

    if (transfer.status === "completed" || transfer.status === "cancelled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot delete stock transfer with id ${id} as it is already completed or cancelled`,
      );
    }

    await stockTransferService.softDeleteStockTransfers(id);

    return new StepResponse(id);
  },
);
