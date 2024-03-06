import { Profile } from "src/modules/profiles/entities/Profile.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'files' })
export class File {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;
  
    @Column()
    filename: string;
  
    @Column()
    originalname: string;
  
    @Column()
    mimetype: string;
  
    @Column()
    size: number; // In bits ?
  
    @Column()
    filePath: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}