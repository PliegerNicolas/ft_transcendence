import { BeforeRemove, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { promisify } from "util";
import * as fs from 'fs';
import { UnprocessableEntityException } from "@nestjs/common";

@Entity({ name: 'files' })
export class File {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;
  
    @Column()
    fieldname: string;
  
    @Column()
    originalname: string;
  
    @Column()
    encoding: string;

    @Column()
    mimetype: string;
  
    @Column()
    size: number;
  
    @Column()
    path: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* Helper Methods */

    @BeforeRemove()
    private async unlink(): Promise<void> {
        const unlinkAsync = promisify(fs.unlink);

        try {
            await unlinkAsync(this.path);
        } catch(error) {
            throw new UnprocessableEntityException(`File '${this.path}' couldn't be removed from system's disk`);
        }
    }

}