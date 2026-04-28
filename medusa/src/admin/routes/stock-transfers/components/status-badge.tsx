import { Badge } from "@medusajs/ui";
import { Status } from "../../../types/stock";

const statusConfig: Record<
  Status,
  { color: "orange" | "green" | "red"; label: string }
> = {
  pending: { color: "orange", label: "Pending" },
  completed: { color: "green", label: "Completed" },
  cancelled: { color: "red", label: "Cancelled" },
};

const StatusBadge = ({ status }: { status: Status }) => {
  const cfg = statusConfig[status];
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
};

export default StatusBadge;
