import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1769259910779 implements MigrationInterface {
    name = 'InitialMigration1769259910779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "interval" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "interval"`);
    }

}
