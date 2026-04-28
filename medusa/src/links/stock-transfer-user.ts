import { defineLink } from "@medusajs/framework/utils";
import StockTransferModule from "@/modules/stock-transfer";
import UserModule from "@medusajs/medusa/user";

export default defineLink(
  {
    linkable: StockTransferModule.linkable.stockTransfer,
    field: "requested_by",
  },
  UserModule.linkable.user,
  { readOnly: true },
);
