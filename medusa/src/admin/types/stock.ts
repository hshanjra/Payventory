export type Status = "pending" | "completed" | "cancelled";

export type StockLocation = {
  id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  address_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type InventoryItem = {
  id: string;
  sku: string | null;
  title: string | null;
};

export type TransferItem = {
  id: string;
  expected_quantity: number;
  transferred_quantity: number;
  inventory_item: InventoryItem | null;
};

export type StockTransferUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
};

export type StockTransfer = {
  id: string;
  reference: string | null;
  status: Status;
  from_location_id: string;
  to_location_id: string;
  // Linked via remote links (query.graph traversal)
  user?: StockTransferUser | null;
  items: TransferItem[];
  from_stock_location?: Pick<StockLocation, "id" | "name"> | null;
  to_stock_location?: Pick<StockLocation, "id" | "name"> | null;
  created_at: string;
  updated_at: string;
};
