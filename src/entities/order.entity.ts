import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {BaseEntity} from "./baseEntity";
import {OrderDetailsEntity} from "./orderDetails.entity";

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @Column({
        type: "decimal",
        scale: 2,
        default: 0
    })
    total: number;

    @ManyToOne(() => User)
    @JoinColumn({name: "userId"})
    user: User;

    @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
    orderDetails: OrderDetailsEntity[];
}