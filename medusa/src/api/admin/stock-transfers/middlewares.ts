import {
  MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
  authenticate,
} from "@medusajs/framework/http";
import {
  CreateStockTransferSchema,
  GetStockTransfersSchema,
  UpdateStockTransferSchema,
} from "./validators";
import {
  listStockTransferItemsConfig,
  listStockTransfersConfig,
} from "./query-config";

export const stockTransferMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/stock-transfers*",
    middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
  },
  {
    matcher: "/admin/stock-transfers",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateStockTransferSchema)],
  },
  {
    matcher: "/admin/stock-transfers/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateStockTransferSchema)],
  },
  {
    matcher: "/admin/stock-transfers",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(
        GetStockTransfersSchema,
        listStockTransfersConfig,
      ),
    ],
  },
  {
    matcher: "/admin/stock-transfers/:id/items",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(
        GetStockTransfersSchema,
        listStockTransferItemsConfig,
      ),
    ],
  },
];
