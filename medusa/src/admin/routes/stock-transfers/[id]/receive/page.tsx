import { FocusModal, ProgressTabs, Toaster } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { sdk } from "../../../../lib/sdk";
import ReceiveItemsForm from "../../components/receive-items-form";
import StatCard from "../../components/stat-card";
import { type StockTransfer } from "../../../../types/stock";

const StockTransferReceivePage = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { data: transferData, isLoading } = useQuery({
    queryKey: ["stock-transfers", id],
    queryFn: () =>
      sdk.client.fetch<{ stock_transfer: StockTransfer }>(
        `/admin/stock-transfers/${id}`,
      ),
    enabled: !!id,
  });

  const transfer = transferData?.stock_transfer;

  const totalExpectedQty = transfer?.items.reduce(
    (acc, item) => acc + item.expected_quantity,
    0,
  );

  return (
    <FocusModal
      defaultOpen={true}
      onOpenChange={() => navigate("/stock-transfers")}
    >
      <FocusModal.Content>
        <ProgressTabs defaultValue="receive" className="flex flex-1 flex-col">
          <FocusModal.Header className="justify-start py-0">
            <div className="flex w-full flex-col">
              <ProgressTabs.List className="w-full">
                <ProgressTabs.Trigger value="receive" status="in-progress">
                  Confirm Stock Transfer
                </ProgressTabs.Trigger>
              </ProgressTabs.List>
            </div>
          </FocusModal.Header>

          <FocusModal.Body className="flex flex-1 flex-col p-4 overflow-hidden">
            <ProgressTabs.Content
              value="receive"
              className="flex-1 overflow-y-auto"
            >
              <div className="mx-auto flex w-full max-w-[800px] flex-col gap-y-8 py-8">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12 text-ui-fg-subtle">
                    Loading…
                  </div>
                ) : !transfer ? (
                  <div className="flex items-center justify-center p-12 text-ui-fg-subtle">
                    Transfer not found.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatCard
                        label="From"
                        value={
                          transfer.from_stock_location?.name ??
                          transfer.from_location_id
                        }
                      />
                      <StatCard
                        label="To"
                        value={
                          transfer.to_stock_location?.name ??
                          transfer.to_location_id
                        }
                      />
                      <StatCard
                        label="Summary"
                        value={
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {transfer.items.length} Items
                            </span>
                            <span className="text-xs text-ui-fg-subtle">
                              Total: {totalExpectedQty} units
                            </span>
                          </div>
                        }
                      />
                    </div>

                    <ReceiveItemsForm transfer={transfer} />
                  </>
                )}
                <Toaster />
              </div>
            </ProgressTabs.Content>
          </FocusModal.Body>
        </ProgressTabs>
      </FocusModal.Content>
    </FocusModal>
  );
};

export default StockTransferReceivePage;
