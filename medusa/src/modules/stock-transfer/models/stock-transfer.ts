import { model } from "@medusajs/framework/utils";
import StockTransferItem from "./stock-transfer-item";

export const StockTransfer = model
  .define("stock_transfer", {
    id: model.id({ prefix: "stf" }).primaryKey(),
    reference: model.text().nullable(),
    status: model
      .enum(["pending", "completed", "cancelled"])
      .default("pending"),
    from_location_id: model.text(),
    to_location_id: model.text(),
    requested_by: model.text().nullable(),
    items: model.hasMany(() => StockTransferItem, {
      mappedBy: "stock_transfer",
    }),
  })
  .cascades({
    delete: ["items"],
  })
  .indexes([{ on: ["from_location_id", "to_location_id"] }]);

export default StockTransfer;
