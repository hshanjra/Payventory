import { defineLink } from "@medusajs/framework/utils";
import StockTransferModule from "@/modules/stock-transfer";
import StockLocationModule from "@medusajs/medusa/stock-location";

export default defineLink(
  {
    linkable: StockTransferModule.linkable.stockTransfer,
    field: "from_location_id",
  },
  {
    ...StockLocationModule.linkable.stockLocation.id,
    alias: "from_stock_location",
  },
  {
    readOnly: true,
  },
);
