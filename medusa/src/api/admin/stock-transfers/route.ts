import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { createStockTransferWorkflow } from "@/workflows/stock-transfer/workflows/create-stock-transfer";
import { CreateStockTransferSchemaType } from "./validators";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function POST(
  req: AuthenticatedMedusaRequest<CreateStockTransferSchemaType>,
  res: MedusaResponse,
) {
  const { result } = await createStockTransferWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      requested_by: req.auth_context?.actor_id || "admin",
    },
  });

  return res.status(200).json({ stock_transfer: result });
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data, metadata } = await query.graph({
    entity: "stock_transfer",
    ...req.queryConfig,
  });

  return res.status(200).json({
    stock_transfers: data,
    count: metadata?.count ?? data.length,
    limit: req.queryConfig?.pagination?.take,
    offset: req.queryConfig?.pagination?.skip,
  });
}
