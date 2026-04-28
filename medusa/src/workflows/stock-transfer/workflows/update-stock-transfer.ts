import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateStockTransferStep,
  UpdateStockTransferInput,
} from "../steps/update-stock-transfer";

export const updateStockTransferWorkflow = createWorkflow(
  "update-stock-transfer",
  function (input: UpdateStockTransferInput) {
    const updatedTransfer = updateStockTransferStep(input);

    return new WorkflowResponse(updatedTransfer);
  },
);
