import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./category.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        length: 20,
    })
    name: string;

    @Column({
        type: "decimal",
    })
    price: number;

    @Column({
        type: "int",
        default: 0
    })
    stock: number;

    @ManyToOne(() => Category)
    category: Category
}