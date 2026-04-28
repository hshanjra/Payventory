import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222100058 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "stock_transfer_item" drop constraint if exists "stock_transfer_item_stock_transfer_id_foreign";`);

    this.addSql(`alter table if exists "stock_transfer_item" add constraint "stock_transfer_item_stock_transfer_id_foreign" foreign key ("stock_transfer_id") references "stock_transfer" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "stock_transfer_item" drop constraint if exists "stock_transfer_item_stock_transfer_id_foreign";`);

    this.addSql(`alter table if exists "stock_transfer_item" add constraint "stock_transfer_item_stock_transfer_id_foreign" foreign key ("stock_transfer_id") references "stock_transfer" ("id") on update cascade;`);
  }

}
