import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { deleteStockTransferStep } from "../steps/delete-stock-transfer";

export const deleteStockTransferWorkflow = createWorkflow(
  "delete-stock-transfer",
  function (id: string) {
    const deletedId = deleteStockTransferStep(id);
    return new WorkflowResponse(deletedId);
  },
);
