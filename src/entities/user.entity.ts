import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./baseEntity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: "varchar",
        length: 50,
        nullable: false
    })
    name: string;

    @Column({
        type: "varchar",
        length: 25,
        unique: true,
        nullable: false
    })
    email: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: false
    })
    password: string;
}