export const defaultStockTransferFields = [
  "id",
  "reference",
  "status",
  "from_location_id",
  "to_location_id",
  "items.*",
  "items.inventory_item.*",
  "user.*",
  "from_stock_location.*",
  "to_stock_location.*",
];

export const listStockTransfersConfig = {
  defaults: defaultStockTransferFields,
  isList: true,
  defaultLimit: 50,
};

export const defaultStockTransferItemFields = [
  "id",
  "expected_quantity",
  "transferred_quantity",
  "inventory_item.*",
];

export const listStockTransferItemsConfig = {
  defaults: defaultStockTransferItemFields,
  isList: true,
  defaultLimit: 50,
};
