import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./category.entity";
import {BaseEntity} from "./baseEntity";

@Entity()
export class Product extends BaseEntity {
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


    @Column({ type: "int", nullable: true })
    categoryId: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: "categoryId" })
    category: Category
}