import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTableOrdersProducts1599351812304
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: 'orders_products',
        columns: [
          {
            name: 'id',
            isPrimary: true,
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 8,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_ORDERS_PRODUCTS_ORDER',
            columnNames: ['order_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'orders',
          },
          {
            name: 'FK_ORDERS_PRODUCTS_PRODUCT',
            columnNames: ['product_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'products',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.dropForeignKey(
        'ororders_productsders',
        'FK_ORDERS_PRODUCTS_ORDER',
      ),
      queryRunner.dropForeignKey(
        'orders_products',
        'FK_ORDERS_PRODUCTS_PRODUCT',
      ),
      queryRunner.dropTable('orders'),
    ]);
  }
}
