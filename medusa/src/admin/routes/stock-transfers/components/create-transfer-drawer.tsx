import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sdk } from "../../../lib/sdk";

type StockLocation = { id: string; name: string };

type InventoryLevel = {
  location_id: string;
  available_quantity: number;
};

type InventoryItem = {
  id: string;
  sku: string | null;
  title: string | null;
  location_levels?: InventoryLevel[];
};

const CreateSchema = z.object({
  reference: z.string().optional(),
  from_location_id: z.string().min(1, "Source location is required"),
  to_location_id: z.string().min(1, "Destination location is required"),
  items: z
    .array(
      z.object({
        inventory_item_id: z.string().min(1, "Item is required"),
        expected_quantity: z.coerce.number().min(1, "Qty must be ≥ 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

type CreateFormValues = z.infer<typeof CreateSchema>;

const CreateTransferDrawer = ({ onCreated }: { onCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: locationsData } = useQuery({
    queryKey: ["stock-locations"],
    queryFn: () =>
      sdk.client.fetch<{ stock_locations: StockLocation[] }>(
        "/admin/stock-locations",
      ),
    enabled: open,
  });

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: () =>
      sdk.client.fetch<{ inventory_items: InventoryItem[] }>(
        "/admin/inventory-items",
        {
          query: {
            fields: "+location_levels",
          },
        },
      ),
    enabled: open,
  });

  const locations = locationsData?.stock_locations ?? [];
  const inventoryItems = inventoryData?.inventory_items ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(CreateSchema),
    defaultValues: { items: [{ inventory_item_id: "", expected_quantity: 1 }] },
  });

  const fromLocationId = watch("from_location_id");

  const getAvailableQuantity = (itemId: string) => {
    if (!fromLocationId) return null;
    const item = inventoryItems.find((i) => i.id === itemId);
    const level = item?.location_levels?.find(
      (l) => l.location_id === fromLocationId,
    );
    return level?.available_quantity ?? 0;
  };

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const createMutation = useMutation({
    mutationFn: (data: CreateFormValues) =>
      sdk.client.fetch("/admin/stock-transfers", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      toast.success("Stock transfer created");
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      reset();
      setOpen(false);
      onCreated();
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to create stock transfer"),
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button size="small">New Transfer</Button>
      </Drawer.Trigger>

      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Create Stock Transfer</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          {/* Reference */}
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="reference" size="small">
              Reference (optional)
            </Label>
            <Input
              id="reference"
              placeholder="e.g. TR-1001"
              {...register("reference")}
            />
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col gap-y-1">
              <Label size="small">
                From Location <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => setValue("from_location_id", v)}>
                <Select.Trigger>
                  <Select.Value placeholder="Select source" />
                </Select.Trigger>
                <Select.Content>
                  {locations.map((loc) => (
                    <Select.Item key={loc.id} value={loc.id}>
                      {loc.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {errors.from_location_id && (
                <Text size="small" className="text-red-500">
                  {errors.from_location_id.message}
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-y-1">
              <Label size="small">
                To Location <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => setValue("to_location_id", v)}>
                <Select.Trigger>
                  <Select.Value placeholder="Select destination" />
                </Select.Trigger>
                <Select.Content>
                  {locations.map((loc) => (
                    <Select.Item key={loc.id} value={loc.id}>
                      {loc.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {errors.to_location_id && (
                <Text size="small" className="text-red-500">
                  {errors.to_location_id.message}
                </Text>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <Label size="small">
                Items <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() =>
                  append({ inventory_item_id: "", expected_quantity: 1 })
                }
              >
                + Add Item
              </Button>
            </div>

            {errors.items?.root && (
              <Text size="small" className="text-red-500">
                {errors.items.root.message}
              </Text>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-x-2 border border-ui-border-base rounded-lg p-3"
              >
                <div className="flex-1 flex flex-col gap-y-1">
                  <Label size="small">Inventory Item</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue(`items.${index}.inventory_item_id`, v)
                    }
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select item" />
                    </Select.Trigger>
                    <Select.Content>
                      {inventoryItems.map((item) => {
                        const avail = getAvailableQuantity(item.id);
                        return (
                          <Select.Item key={item.id} value={item.id}>
                            {item.title ?? item.sku ?? item.id}
                            {typeof avail === "number" && (
                              <span className="text-ui-fg-subtle">
                                {" "}
                                ({avail} available)
                              </span>
                            )}
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select>
                  {errors.items?.[index]?.inventory_item_id && (
                    <Text size="small" className="text-red-500">
                      {errors.items[index]?.inventory_item_id?.message}
                    </Text>
                  )}
                </div>

                <div className="w-24 flex flex-col gap-y-1">
                  <Label size="small">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`items.${index}.expected_quantity`)}
                  />
                  {errors.items?.[index]?.expected_quantity && (
                    <Text size="small" className="text-red-500">
                      {errors.items[index]?.expected_quantity?.message}
                    </Text>
                  )}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-6 text-ui-fg-subtle hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            onClick={handleSubmit((d) => createMutation.mutate(d))}
            isLoading={isSubmitting || createMutation.isPending}
          >
            Create Transfer
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default CreateTransferDrawer;
