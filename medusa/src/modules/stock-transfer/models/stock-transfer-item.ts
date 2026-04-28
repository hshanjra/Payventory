import { model } from "@medusajs/framework/utils";
import StockTransfer from "./stock-transfer";

export const StockTransferItem = model.define("stock_transfer_item", {
  id: model.id({ prefix: "stfi" }).primaryKey(),
  expected_quantity: model.number(),
  transferred_quantity: model.number().default(0),
  stock_transfer: model.belongsTo(() => StockTransfer, {
    mappedBy: "items",
  }),
});

export default StockTransferItem;
