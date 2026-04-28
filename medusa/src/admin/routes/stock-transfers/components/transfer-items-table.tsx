import { Table, Text } from "@medusajs/ui";
import { type TransferItem } from "../../../types/stock";

const TransferItemsTable = ({ items }: { items: TransferItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-ui-fg-subtle">
        No items in this transfer.
      </div>
    );
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>SKU</Table.HeaderCell>
          <Table.HeaderCell>Expected Qty</Table.HeaderCell>
          <Table.HeaderCell>Transferred Qty</Table.HeaderCell>
          <Table.HeaderCell>Progress</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item, idx) => {
          const pct = item.expected_quantity
            ? Math.min(
                100,
                Math.round(
                  (item.transferred_quantity / item.expected_quantity) * 100,
                ),
              )
            : 0;

          const title = item.inventory_item?.title ?? null;
          const sku = item.inventory_item?.sku ?? null;

          return (
            <Table.Row key={item.id}>
              <Table.Cell className="w-12">
                <Text size="small" className="text-ui-fg-subtle">
                  {idx + 1}
                </Text>
              </Table.Cell>

              <Table.Cell>
                {title ? (
                  <Text size="small" className="font-medium">
                    {title}
                  </Text>
                ) : (
                  <Text size="small" className="text-ui-fg-muted italic">
                    —
                  </Text>
                )}
              </Table.Cell>

              <Table.Cell>
                {sku ? (
                  <Text size="small" className="font-mono text-ui-fg-subtle">
                    {sku}
                  </Text>
                ) : (
                  <Text size="small" className="text-ui-fg-muted italic">
                    —
                  </Text>
                )}
              </Table.Cell>

              <Table.Cell>
                <Text size="small">{item.expected_quantity}</Text>
              </Table.Cell>

              <Table.Cell>
                <Text size="small">{item.transferred_quantity}</Text>
              </Table.Cell>

              <Table.Cell>
                <div className="flex items-center gap-x-3">
                  <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-ui-bg-switch-off overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ui-fg-interactive transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <Text
                    size="xsmall"
                    className="text-ui-fg-subtle tabular-nums w-8"
                  >
                    {pct}%
                  </Text>
                </div>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default TransferItemsTable;
