import { defineMiddlewares } from "@medusajs/framework/http";
import { stockTransferMiddlewares } from "./admin/stock-transfers/middlewares";

export default defineMiddlewares({
  routes: [...stockTransferMiddlewares],
});
