import { Button, Input, Table, Text, toast } from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { sdk } from "../../../lib/sdk";
import { type StockTransfer } from "../../../types/stock";

type ReceiveItemsFormProps = {
  transfer: StockTransfer;
};

type FormValues = {
  items: {
    id: string;
    inventory_item_id: string;
    title: string | null;
    sku: string | null;
    expected_quantity: number;
    transferred_quantity: number;
  }[];
};

const ReceiveItemsForm = ({ transfer }: ReceiveItemsFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      items: transfer.items.map((item) => ({
        id: item.id,
        inventory_item_id: item.inventory_item?.id ?? "",
        title: item.inventory_item?.title ?? "Unknown Item",
        sku: item.inventory_item?.sku ?? null,
        expected_quantity: item.expected_quantity,
        transferred_quantity: item.expected_quantity, // Prefill with expected qty
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      sdk.client.fetch(`/admin/stock-transfers/${transfer.id}`, {
        method: "POST",
        body: {
          status: "completed",
          items: data.items.map((i) => ({
            item_id: i.id,
            transferred_quantity: Number(i.transferred_quantity),
          })),
        },
      }),
    onSuccess: () => {
      toast.success("Transferred quantities updated");
      queryClient.invalidateQueries({
        queryKey: ["stock-transfers"],
      });
      navigate(`/stock-transfers/${transfer.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update items");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-y-8"
    >
      <div className="overflow-hidden border border-ui-border-base rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Item</Table.HeaderCell>
              <Table.HeaderCell>SKU</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Expected
              </Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Transferred
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => (
              <Table.Row key={field.id} className="hover:bg-ui-bg-base-hover">
                <Table.Cell>
                  <Text size="small" className="font-medium">
                    {field.title}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="font-mono text-ui-fg-subtle">
                    {field.sku || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Text size="small">{field.expected_quantity}</Text>
                </Table.Cell>
                <Table.Cell className="w-[120px]">
                  <div className="flex justify-end">
                    <Input
                      {...register(
                        `items.${index}.transferred_quantity` as const,
                        {
                          required: true,
                          min: 0,
                          valueAsNumber: true,
                        },
                      )}
                      type="number"
                      size="small"
                      className="text-right tabular-nums w-24"
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-x-2">
        <Button
          variant="secondary"
          type="button"
          onClick={() => navigate(`/stock-transfers/${transfer.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Save Quantities
        </Button>
      </div>
    </form>
  );
};

export default ReceiveItemsForm;
