import { Heading, Toaster } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { sdk } from "../../../../lib/sdk";
import EditTransferForm from "../../components/edit-transfer-form";
import { type StockTransfer } from "../../../../types/stock";

const StockTransferEditPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: transferData, isLoading } = useQuery({
    queryKey: ["stock-transfers", id],
    queryFn: () =>
      sdk.client.fetch<{ stock_transfer: StockTransfer }>(
        `/admin/stock-transfers/${id}`,
      ),
    enabled: !!id,
  });

  const transfer = transferData?.stock_transfer;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-ui-fg-subtle">
        Loading…
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex items-center justify-center p-12 text-ui-fg-subtle">
        Transfer not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6 p-8 max-w-2xl">
      <Toaster />
      <Heading level="h1">Edit Transfer</Heading>
      <EditTransferForm transfer={transfer} />
    </div>
  );
};

export default StockTransferEditPage;
