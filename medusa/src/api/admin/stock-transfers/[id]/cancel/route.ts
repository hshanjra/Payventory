import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { cancelStockTransferWorkflow } from "@/workflows/stock-transfer/workflows/cancel-stock-transfer";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { id } = req.params;

  const { result } = await cancelStockTransferWorkflow(req.scope).run({
    input: id,
  });

  return res.status(200).json({ id: result, cancelled: true });
}
