import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Product} from "./product.entity";

@Entity()
export class Category {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({
        type: "varchar",
        length: 20,
        unique: true,
    })
    name: string

    @OneToMany(() => Product)
    products: Product[]
}