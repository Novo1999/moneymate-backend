import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1767324273467 implements MigrationInterface {
    name = 'InitialMigration1767324273467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "note" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "note"`);
    }

}
