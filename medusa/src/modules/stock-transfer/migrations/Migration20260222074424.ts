import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222074424 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "stock_transfer" ("id" text not null, "reference" text null, "status" text check ("status" in ('pending', 'completed', 'cancelled')) not null default 'pending', "from_location_id" text not null, "to_location_id" text not null, "requested_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_transfer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_transfer_deleted_at" ON "stock_transfer" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "stock_transfer_item" ("id" text not null, "expected_quantity" integer not null, "transferred_quantity" integer not null default 0, "stock_transfer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_transfer_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_transfer_item_stock_transfer_id" ON "stock_transfer_item" ("stock_transfer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_transfer_item_deleted_at" ON "stock_transfer_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "stock_transfer_item" add constraint "stock_transfer_item_stock_transfer_id_foreign" foreign key ("stock_transfer_id") references "stock_transfer" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "stock_transfer_item" drop constraint if exists "stock_transfer_item_stock_transfer_id_foreign";`);

    this.addSql(`drop table if exists "stock_transfer" cascade;`);

    this.addSql(`drop table if exists "stock_transfer_item" cascade;`);
  }

}
