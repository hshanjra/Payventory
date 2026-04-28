import StockTransferModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const STOCK_TRANSFER_MODULE = "stockTransfer";

export default Module(STOCK_TRANSFER_MODULE, {
  service: StockTransferModuleService,
});
