import {
  Badge,
  Button,
  Table,
  Text,
  usePrompt,
  clx,
  toast,
} from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./status-badge";
import { sdk } from "../../../lib/sdk";
import { StockTransfer } from "../../../types/stock";

const TransferTable = ({ transfers }: { transfers: StockTransfer[] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dialog = usePrompt();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sdk.client.fetch(`/admin/stock-transfers/${id}`, {
        method: "POST",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("Transfer updated");
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
    },
    onError: () => toast.error("Failed to update transfer"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/stock-transfers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Transfer deleted");
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
    },
    onError: () => toast.error("Failed to delete transfer"),
  });

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await dialog({
      title: "Complete Transfer",
      description: "Mark this transfer as completed?",
    });
    if (ok) updateMutation.mutate({ id, status: "completed" });
  };

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await dialog({
      title: "Cancel Transfer",
      description: "Cancel this transfer? This cannot be undone.",
    });
    if (ok) updateMutation.mutate({ id, status: "cancelled" });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await dialog({
      title: "Delete Transfer",
      description: "Permanently delete this transfer? This cannot be undone.",
    });
    if (ok) deleteMutation.mutate(id);
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Reference</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>From</Table.HeaderCell>
          <Table.HeaderCell>To</Table.HeaderCell>
          <Table.HeaderCell>Items</Table.HeaderCell>
          <Table.HeaderCell>Requested By</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {transfers.map((transfer) => (
          <Table.Row
            key={transfer.id}
            className="[&_td:last-child]:w-0 cursor-pointer"
            onClick={() => navigate(`/stock-transfers/${transfer.id}`)}
          >
            {/* Reference + ID */}
            <Table.Cell>
              <Text size="small" className="font-medium">
                {transfer.reference ?? (
                  <span className="text-ui-fg-muted italic">No reference</span>
                )}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted font-mono">
                {transfer.id}
              </Text>
            </Table.Cell>

            {/* Status */}
            <Table.Cell>
              <StatusBadge status={transfer.status} />
            </Table.Cell>

            {/* From location — name, not ID */}
            <Table.Cell>
              <Text size="small">{transfer.from_stock_location?.name}</Text>
            </Table.Cell>

            {/* To location — name, not ID */}
            <Table.Cell>
              <Text size="small">{transfer.to_stock_location?.name}</Text>
            </Table.Cell>

            {/* Item count */}
            <Table.Cell>
              <Badge color="grey">{transfer.items?.length ?? 0} items</Badge>
            </Table.Cell>

            {/* Requested by */}
            <Table.Cell>
              <Text size="small">
                {transfer.user?.first_name ?? transfer.user?.email ?? "—"}
              </Text>
            </Table.Cell>

            {/* Row actions — stop propagation so row click doesn't fire */}
            <Table.Cell>
              <div
                className="flex items-center justify-end gap-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                {transfer.status === "pending" && (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => handleComplete(e, transfer.id)}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => handleCancel(e, transfer.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  className={clx(
                    "text-red-500 hover:text-red-600",
                    transfer.status !== "pending" && "ml-auto",
                  )}
                  onClick={(e) => handleDelete(e, transfer.id)}
                >
                  Delete
                </Button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export type { StockTransfer };
export default TransferTable;
