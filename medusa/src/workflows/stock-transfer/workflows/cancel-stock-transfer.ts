import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { cancelStockTransferStep } from "../steps/cancel-stock-transfer";
import { adjustInventoryLevelsStep } from "@medusajs/medusa/core-flows";

export const cancelStockTransferWorkflow = createWorkflow(
  "cancel-stock-transfer",
  function (id: string) {
    const { transfer, adjustments } = cancelStockTransferStep(id);

    adjustInventoryLevelsStep(adjustments);

    return new WorkflowResponse(transfer);
  },
);
