import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Product} from "./product.entity";
import {BaseEntity} from "./baseEntity";

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({
        type: "varchar",
        length: 20,
        unique: true,
    })
    name: string

    @OneToMany(() => Product, (product) => product.category)
    products: Product[]
}