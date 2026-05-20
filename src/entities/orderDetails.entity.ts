import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Order} from "./order.entity";
import {Product} from "./product.entity";
import {BaseEntity} from "./baseEntity";

@Entity()
export class OrderDetailsEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "int",
        default: 0
    })
    quantity: number;

    @Column({
        type: "decimal",
        scale: 2,
        default: 0
    })
    unitPrice: number;

    @ManyToOne(() => Order, (order) => order.orderDetails)
    @JoinColumn({name: "orderId"})
    order: Order;

    @ManyToOne(() => Product)
    @JoinColumn({name: "productId"})
    product: Product;
}