import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1770439370925 implements MigrationInterface {
    name = 'InitialMigration1770439370925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, ensure all NULL values have a default before dropping
        await queryRunner.query(`
            UPDATE "transaction" 
            SET "category" = 'others_expense' 
            WHERE "category" IS NULL
        `);
        
        // Convert enum column to varchar (don't drop and re-add)
        await queryRunner.query(`
            ALTER TABLE "transaction" 
            ALTER COLUMN "category" TYPE character varying 
            USING category::varchar
        `);
        
        // Drop the old enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."transaction_category_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the enum type
        await queryRunner.query(`CREATE TYPE "public"."transaction_category_enum" AS ENUM('awards', 'communication_pc', 'coupon', 'financial_expenses', 'food_drinks', 'gifts', 'grants', 'housing', 'interests', 'investments', 'life_entertainment', 'lottery', 'others_expense', 'others_income', 'refunds', 'rental', 'salary', 'sale', 'shopping', 'transfer', 'transfer_income', 'transportation', 'vehicle')`);
        
        // Convert back to enum
        await queryRunner.query(`
            ALTER TABLE "transaction" 
            ALTER COLUMN "category" TYPE "public"."transaction_category_enum" 
            USING category::"public"."transaction_category_enum"
        `);
    }
}
