import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const { data, metadata } = await query.graph({
    entity: "stock_transfer_item",
    filters: { stock_transfer_id: id },
    ...req.queryConfig,
  });

  return res.status(200).json({
    stock_transfer_items: data,
    metadata,
  });
}
