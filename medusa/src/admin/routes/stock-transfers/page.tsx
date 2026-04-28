import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowsPointingOutMini } from "@medusajs/icons";
import { Container, Heading, Text, Toaster } from "@medusajs/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";
import CreateTransferDrawer from "./components/create-transfer-drawer";
import TransferTable, { type StockTransfer } from "./components/transfer-table";

const StockTransfersPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-transfers"],
    queryFn: () =>
      sdk.client.fetch<{ stock_transfers: StockTransfer[] }>(
        "/admin/stock-transfers",
      ),
  });

  const transfers = data?.stock_transfers ?? [];

  return (
    <div className="flex flex-col gap-y-4 p-8">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Stock Transfers</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage inventory movements between locations
          </Text>
        </div>
        <CreateTransferDrawer
          onCreated={() =>
            queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })
          }
        />
      </div>

      {/* Table container */}
      <Container className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-ui-fg-subtle">
            Loading transfers…
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-y-2 p-12 text-center">
            <ArrowsPointingOutMini className="text-ui-fg-muted h-8 w-8" />
            <Text className="font-medium">No stock transfers yet</Text>
            <Text size="small" className="text-ui-fg-subtle">
              Create your first transfer using the button above.
            </Text>
          </div>
        ) : (
          <TransferTable transfers={transfers} />
        )}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Stock Transfers",
  nested: "/inventory",
});

export const handle = {
  breadcrumb: () => "Stock Transfers",
};

export default StockTransfersPage;
