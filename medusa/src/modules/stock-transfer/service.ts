import { MedusaService } from "@medusajs/framework/utils";
import StockTransfer from "./models/stock-transfer";
import StockTransferItem from "./models/stock-transfer-item";

class StockTransferModuleService extends MedusaService({
  StockTransfer,
  StockTransferItem,
}) {}

export default StockTransferModuleService;
