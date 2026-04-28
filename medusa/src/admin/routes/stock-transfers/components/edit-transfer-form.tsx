import {
  Button,
  Container,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sdk } from "../../../lib/sdk";
import { type StockTransfer } from "../../../types/stock";

const EditSchema = z.object({
  reference: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]),
});
type EditFormValues = z.infer<typeof EditSchema>;

const EditTransferForm = ({ transfer }: { transfer: StockTransfer }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(EditSchema),
    defaultValues: { reference: "", status: "pending" },
  });

  // Populate form once transfer data is available
  useEffect(() => {
    reset({
      reference: transfer.reference ?? "",
      status: transfer.status,
    });
  }, [transfer, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditFormValues) =>
      sdk.client.fetch(`/admin/stock-transfers/${transfer.id}`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      toast.success("Transfer updated");
      queryClient.invalidateQueries({
        queryKey: ["stock-transfers", transfer.id],
      });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      navigate(`/stock-transfers/${transfer.id}`);
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to update transfer"),
  });

  const currentStatus = watch("status");

  // Location names already in the transfer object (from linked query.graph data)
  const fromName =
    transfer.from_stock_location?.name ?? transfer.from_location_id;
  const toName = transfer.to_stock_location?.name ?? transfer.to_location_id;

  return (
    <div className="flex flex-col gap-y-5">
      {/* Read-only location info — names come from linked data, no extra fetch */}
      <Container className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text
              size="xsmall"
              className="text-ui-fg-subtle uppercase tracking-wider font-medium mb-1"
            >
              From Location
            </Text>
            <Text size="small" className="font-medium">
              {fromName}
            </Text>
          </div>
          <div>
            <Text
              size="xsmall"
              className="text-ui-fg-subtle uppercase tracking-wider font-medium mb-1"
            >
              To Location
            </Text>
            <Text size="small" className="font-medium">
              {toName}
            </Text>
          </div>
        </div>
        <Text size="xsmall" className="text-ui-fg-muted mt-3">
          Locations cannot be changed after creation. Delete and recreate the
          transfer to use different locations.
        </Text>
      </Container>

      {/* Editable form fields */}
      <form
        onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
        className="flex flex-col gap-y-5"
      >
        {/* Reference */}
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="edit-reference" size="small">
            Reference
          </Label>
          <Input
            id="edit-reference"
            placeholder="e.g. TR-1001"
            {...register("reference")}
          />
          {errors.reference && (
            <Text size="small" className="text-red-500">
              {errors.reference.message}
            </Text>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-y-1.5">
          <Label size="small">Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(v) =>
              setValue("status", v as EditFormValues["status"], {
                shouldDirty: true,
              })
            }
          >
            <Select.Trigger id="edit-status">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="completed">Completed</Select.Item>
              <Select.Item value="cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select>
          {errors.status && (
            <Text size="small" className="text-red-500">
              {errors.status.message}
            </Text>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-x-3 pt-2">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate(`/stock-transfers/${transfer.id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isDirty}
            isLoading={isSubmitting || updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTransferForm;
