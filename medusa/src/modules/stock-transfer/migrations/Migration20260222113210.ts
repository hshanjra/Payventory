import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222113210 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_transfer_from_location_id_to_location_id" ON "stock_transfer" ("from_location_id", "to_location_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_stock_transfer_from_location_id_to_location_id";`);
  }

}
