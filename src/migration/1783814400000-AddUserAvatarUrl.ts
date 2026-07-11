import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAvatarUrl1783814400000 implements MigrationInterface {
    name = 'AddUserAvatarUrl1783814400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarUrl"`);
    }
}
