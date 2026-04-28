import { defineLink } from "@medusajs/framework/utils";
import StockTransferModule from "@/modules/stock-transfer";
import InventoryModule from "@medusajs/medusa/inventory";

export default defineLink(
  {
    linkable: StockTransferModule.linkable.stockTransferItem,
    isList: true,
  },
  InventoryModule.linkable.inventoryItem,
);
