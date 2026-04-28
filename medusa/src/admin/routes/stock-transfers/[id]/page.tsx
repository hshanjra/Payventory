import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
  Toaster,
  toast,
  usePrompt,
} from "@medusajs/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { sdk } from "../../../lib/sdk";
import StatCard from "../components/stat-card";
import StatusBadge from "../components/status-badge";
import TransferItemsTable from "../components/transfer-items-table";
import { type StockTransfer } from "../../../types/stock";

const StockTransferDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dialog = usePrompt();

  // Single query — returns items.*, from_stock_location.*, to_stock_location.*, user.* all at once
  const { data, isLoading } = useQuery({
    queryKey: ["stock-transfers", id],
    queryFn: () =>
      sdk.client.fetch<{ stock_transfer: StockTransfer }>(
        `/admin/stock-transfers/${id}`,
      ),
    enabled: !!id,
  });

  const transfer = data?.stock_transfer;
  const items = transfer?.items ?? [];

  const totalExpected = items.reduce((s, i) => s + i.expected_quantity, 0);
  const totalTransferred = items.reduce(
    (s, i) => s + i.transferred_quantity,
    0,
  );

  const updateMutation = useMutation({
    mutationFn: (status: string) =>
      sdk.client.fetch(`/admin/stock-transfers/${id}`, {
        method: "POST",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("Transfer updated");
      queryClient.invalidateQueries({ queryKey: ["stock-transfers", id] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
    },
    onError: () => toast.error("Failed to update transfer"),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/stock-transfers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Transfer deleted");
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      navigate("/stock-transfers");
    },
    onError: () => toast.error("Failed to delete transfer"),
  });

  const handleCancel = async () => {
    const ok = await dialog({
      title: "Cancel Transfer",
      description: "Cancel this transfer? This cannot be undone.",
    });
    if (ok) updateMutation.mutate("cancelled");
  };

  const handleDelete = async () => {
    const ok = await dialog({
      title: "Delete Transfer",
      description: "Permanently delete this transfer?",
    });
    if (ok) deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-ui-fg-subtle">
        Loading transfer…
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex items-center justify-center p-16 text-ui-fg-subtle">
        Transfer not found.
      </div>
    );
  }

  const requestedBy = transfer.user
    ? `${transfer.user.first_name ?? ""} ${transfer.user.last_name ?? ""}`.trim() ||
      transfer.user.email
    : null;

  return (
    <div className="flex flex-col gap-y-6 p-8">
      <Toaster />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-y-0.5">
          <Heading level="h1">
            {transfer.reference ?? "Untitled Transfer"}
          </Heading>
          {requestedBy && (
            <Text size="small" className="text-ui-fg-subtle">
              Requested by {requestedBy}
            </Text>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate(`/stock-transfers/${id}/edit`)}
          >
            Edit
          </Button>
          {transfer.status === "pending" && (
            <>
              <Button
                variant="secondary"
                size="small"
                onClick={() => navigate(`/stock-transfers/${id}/receive`)}
              >
                Receive
              </Button>

              <Button
                variant="secondary"
                size="small"
                className="text-red-500 hover:text-red-600"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="small"
            className="text-red-500 hover:text-red-600"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Overview cards — location names come from linked data, no extra query */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label="Status"
          value={<StatusBadge status={transfer.status} />}
        />
        <StatCard
          label="From"
          value={
            transfer.from_stock_location?.name ?? transfer.from_location_id
          }
        />
        <StatCard
          label="To"
          value={transfer.to_stock_location?.name ?? transfer.to_location_id}
        />
        <StatCard label="Expected Qty" value={totalExpected} />
        <StatCard label="Transferred Qty" value={totalTransferred} />
      </div>

      {/* Items table — items embedded in the transfer response */}
      <Container className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <Heading level="h2">Transfer Items</Heading>
          <Badge color="grey">{items.length} items</Badge>
        </div>
        <TransferItemsTable items={items} />
      </Container>
    </div>
  );
};

export default StockTransferDetailPage;
