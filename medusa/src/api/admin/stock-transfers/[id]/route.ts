import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { updateStockTransferWorkflow } from "@/workflows/stock-transfer/workflows/update-stock-transfer";
import { deleteStockTransferWorkflow } from "@/workflows/stock-transfer/workflows/delete-stock-transfer";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { defaultStockTransferFields } from "../query-config";
import { UpdateStockTransferSchemaType } from "../validators";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const { data } = await query.graph({
    entity: "stock_transfer",
    filters: { id },
    fields: defaultStockTransferFields,
  });

  if (!data || data.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Stock Transfer not found",
    );
  }

  return res.status(200).json({ stock_transfer: data[0] });
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateStockTransferSchemaType>,
  res: MedusaResponse,
) {
  const { id } = req.params;

  const { result } = await updateStockTransferWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  });

  return res.status(200).json({ stock_transfer: result });
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { id } = req.params;

  const { result } = await deleteStockTransferWorkflow(req.scope).run({
    input: id,
  });

  return res.status(200).json({ id: result, deleted: true });
}
