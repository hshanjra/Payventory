import { Text } from "@medusajs/ui";

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col justify-between gap-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-5 shadow-sm">
    <Text
      size="xsmall"
      className="text-ui-fg-muted font-medium uppercase tracking-widest"
    >
      {label}
    </Text>
    <div className="text-xl font-semibold text-ui-fg-base leading-none">
      {value}
    </div>
  </div>
);

export default StatCard;
